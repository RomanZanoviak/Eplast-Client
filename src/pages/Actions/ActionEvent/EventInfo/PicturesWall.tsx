import {List, Card, Row, Col, Tooltip, notification, Modal} from 'antd';
import React, {useState} from 'react';
import {EventGallery} from "./EventInfo";
import {DeleteOutlined, EyeOutlined} from "@ant-design/icons/lib";
import eventsApi from "../../../../api/eventsApi";

const classes = require('./EventInfo.module.css');

interface Props {
    pictures: EventGallery[];
    removePicture: (pictureId: number) => void;
}

const PicturesWall = ({pictures, removePicture}: Props) => {
    const [previewVisible,setPreviewVisibility]=useState(false);
    const [previewImage,setPreviewImage]=useState('');
    const deletePicture = async (id: number) => {
        return await eventsApi.removePicture(id);
    };
    const RenderPictureWallActions = (id: number,pictureInBase64:string): React.ReactNode[] => {
        const pictureActions: React.ReactNode[] = []
        pictureActions.push(
            <EyeOutlined
                className={classes.eyeDetails}
                key="details"
                onClick={()=>{
                    setPreviewImage(pictureInBase64);
                setPreviewVisibility(true);
                }}
            />
        );
        pictureActions.push(
            <DeleteOutlined
                className={classes.deletePicture}
                key="deletePicture"
                onClick={() => deletePicture(id)
                    .then(() => removePicture(id))
                    .catch(() => notification.error({message: 'Не вдалося видалити зображення', duration: 3}))
                }
            />
        );

        return pictureActions;
    }

    return (
        <Row justify="center" style={{marginBottom:'15px'}}>
            <Col span={16} style={{maxHeight: '400px', overflow: 'auto'}}>
                <Row justify="center" gutter={[16, 8]}>
                    {
                        pictures.map(picture => <Col xs={24} md={12} lg={6} key={picture.galleryId}>
                            <Card
                                hoverable
                                cover={<img style={{height: '130px'}} alt="example"
                                            src={picture.fileName}/>}
                                actions={RenderPictureWallActions(picture.galleryId,picture.fileName)}
                                bodyStyle={{display: 'none'}}
                            >
                            </Card>
                        </Col>)
                    }
                    <Modal
                        visible={previewVisible}
                        title='Перегляд картинки.'
                        footer={null}
                        onCancel={()=>setPreviewVisibility(false)}
                    >
                        <img alt="example" style={{ width: '100%' }} src={previewImage} />
                    </Modal>
                </Row>
            </Col>
        </Row>
    )
}

export default PicturesWall;