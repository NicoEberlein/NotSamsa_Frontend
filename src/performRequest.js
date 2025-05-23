const performRequest = async ({url, method, headers=new Headers(), body=undefined, appendAuthorization = false, signal = undefined, parseResponse="json"}) => {

    if(localStorage.getItem("token") !== null && appendAuthorization) {
        headers.append('Authorization',`Bearer ${localStorage.getItem("token")}`);
    }

    const requestBody = (method === 'POST' || method === 'PUT' || method === 'PATCH') && body !== undefined && body !== null
        ? JSON.stringify(body)
        : undefined;

    const response = await fetch(url, {
        method: method,
        headers: headers,
        body: requestBody,
        signal: signal
    })

    if(!response.ok) {

        const httpError = new Error(`error: ${response.status}`);
        httpError.status = response.status;

        let errorBody = null
        try {
            if (response.headers.get('content-length') !== '0' && response.status !== 204) {
                errorBody = await response.json();
            }
            if (errorBody && typeof errorBody === 'object' && errorBody.message && typeof errorBody.message === 'string') {
                httpError.message = errorBody.message;
            } else if (response.statusText) {
                httpError.message = `HTTP error! ${response.status} ${response.statusText}`;
            }
            httpError.responseBody = errorBody;
        }catch(e) {
            console.error("Error parsing body:", e)
        }
        throw httpError
    }

    switch (parseResponse) {
        case 'json':
            return response.json();
        case 'blob':
            { const contentDisposition = response.headers.get('Content-Disposition');
            let fileName = null;
            if (contentDisposition && contentDisposition.indexOf('attachment') !== -1) {
                fileName = contentDisposition.split("=")[1];
            }

            const blob = await response.blob();
            return { blob, fileName: fileName }; }
        case 'text':
            return response.text();
        case 'none':
            return response;
        default:
            console.warn(`Unknown parseReponse`);
            return response.json();
    }


}


export default performRequest;