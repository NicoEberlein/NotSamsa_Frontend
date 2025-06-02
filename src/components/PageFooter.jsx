import {Button, Space} from "antd";
import {useEffect} from "react";
import log from "loglevel";

const PageFooter = (props) => {

    useEffect(() => {
        log.info("Mounted PageFooter")

        return () => {
            log.info("Unmounted PageFooter")
        }
    }, [])

    const { pages, currentPage, setCurrentPage } = props

    if(pages <= 1) {
        return null
    }

    return <Space align="center" size="small">
        {
            Array.from({length: pages}, (_, index) => (
                <Button key={index+1} onClick={() => {
                    setCurrentPage(index+1)
                }}
                type={ currentPage === index+1 ? "primary" : "default" }>{index+1}</Button>
            ))
        }
    </Space>

}

export default PageFooter;