import UsePublish from './UsePublish';
import NewsPublish from './NewsPublish';
import { Button } from 'antd';
export default function Sunset() {
    const { dataSource, handleDelete } = UsePublish(3);

    return (
        <div>
            <NewsPublish
                dataSource={dataSource}
                button={(id) => (
                    <Button type="danger" onClick={() => handleDelete(id)}>
                        删除
                    </Button>
                )}
            ></NewsPublish>
        </div>
    );
}
