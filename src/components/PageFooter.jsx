import {Button, message, Space} from "antd";

const PageFooter = (props) => {

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