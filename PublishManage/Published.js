import UsePublish from './UsePublish';
import NewsPublish from './NewsPublish';
import { Button } from 'antd';

export default function Published() {
    const { dataSource, handleRemove } = UsePublish(2);
    return (
        <div>
            <NewsPublish
                dataSource={dataSource}
                button={(id) => (
                    <Button type="danger" onClick={() => handleRemove(id)}>
                        下撤
                    </Button>
                )}
            ></NewsPublish>
        </div>
    );
}
