import UsePublish from './UsePublish';
import NewsPublish from './NewsPublish';
import { Button } from 'antd';
export default function Unpublished() {
    const { dataSource, handlePublish } = UsePublish(1);

    return (
        <div>
            <NewsPublish
                dataSource={dataSource}
                button={(id) => (
                    <Button type="primary" onClick={() => handlePublish(id)}>
                        发布
                    </Button>
                )}
            ></NewsPublish>
        </div>
    );
}
