import React, { useState } from 'react';
import { Row, Col, Tooltip, Modal, Card, List, Rate } from 'antd';
import {
    IdcardOutlined,
    EditTwoTone,
    DeleteTwoTone,
    StopOutlined,
    SettingTwoTone,
    CheckCircleTwoTone,
    QuestionCircleTwoTone,
    UserDeleteOutlined,
    UserAddOutlined
} from '@ant-design/icons';
import { EventDetails, EventAdmin } from "./EventInfo";
import { showSubscribeConfirm, showUnsubscribeConfirm, showDeleteConfirmForSingleEvent, showApproveConfirm } from "../../EventsModals";
import EventAdminLogo from "../../../../assets/images/EventAdmin.png"
import './EventInfo.less';
import eventsApi from "../../../../api/eventsApi";
import { useHistory, useParams } from 'react-router-dom';
import EventEditDrawer from '../EventEdit/EventEditDrawer';
import eventUserApi from '../../../../api/eventUserApi';
import CreatedEvents from '../../../../models/EventUser/CreatedEvents';
import EventsUser from '../../../../models/EventUser/EventUser';
import userApi from "../../../../api/UserApi";
import { Roles } from '../../../../models/Roles/Roles';

interface Props {
    event: EventDetails;
    visibleDrawer: boolean;
    setApprovedEvent: (visible: boolean) => void;
    setVisibleDrawer: (visible: boolean) => void;
    subscribeOnEvent: () => void;
    unSubscribeOnEvent: () => void;
}

const AccessableRoles = [Roles.Admin.toString(), Roles.KurinHead.toString(), Roles.CityHead.toString(), Roles.OkrugaHead.toString(), Roles.PlastMember.toString(), Roles.Supporter.toString(), Roles.RegisteredUser.toString()];

const AccessToManage = (roles: string[]): boolean => {
    for (var i = 0; i < roles.length; i++) {
        if (AccessableRoles.includes(roles[i])) return true;
    }
    return false;
}
const RenderEventIcons = ({ event,
    isUserEventAdmin, isUserParticipant, isUserApprovedParticipant,
    isUserUndeterminedParticipant, isUserRejectedParticipant, isEventFinished
}: EventDetails,
    setApprovedEvent: (visible: boolean) => void,
    setVisibleDrawer: (visible: boolean) => void,
    subscribeOnEvent: () => void,
    unSubscribeOnEvent: () => void,
    setAdminsVisibility: (flag: boolean) => void
) => {
    const eventIcons: React.ReactNode[] = []
    const roles = ([] as string[]).concat(userApi.getActiveUserRoles());
    const SubscribeToEvent = () => {
        eventIcons.push(<Tooltip title="?????????????????????? ???? ??????????" key="subscribe">
            <UserAddOutlined onClick={() => showSubscribeConfirm({
                eventId: event?.eventId,
                eventName: event?.eventName,
                successCallback: subscribeOnEvent,
                isSingleEventInState: true,
                eventAdmins: event.eventAdmins,
                eventParticipants: event.eventParticipants
            })}
                style={{ color: "#3c5438" }}
                key="subscribe" />
        </Tooltip>)
    }
    const TrackStatus=()=>{

        if (isUserRejectedParticipant) {
            eventIcons.push(<Tooltip placement="bottom" title="???????? ???????????? ???? ???????????? ?? ?????????? ?????????? ??????????????????"
                key="banned">
                <StopOutlined style={{ color: "#8B0000" }} className="icon" key="banned" />
            </Tooltip>)
        } else {
            if (isUserApprovedParticipant) {
                eventIcons.push(<Tooltip placement="bottom" title="??????????????" key="participant">
                    <CheckCircleTwoTone twoToneColor="#73bd79" className="icon" key="participant" />
                </Tooltip>)
            }
            if (isUserUndeterminedParticipant) {
                eventIcons.push(<Tooltip placement="bottom" title="???????? ???????????? ??????????????????????????" key="underReview">
                    <QuestionCircleTwoTone twoToneColor="#FF8C00" className="icon" key="underReview" />
                </Tooltip>)
            }
            eventIcons.push(<Tooltip placement="bottom" title="?????????????????????? ?????? ??????????" key="unsubscribe">
                <UserDeleteOutlined
                    onClick={() => showUnsubscribeConfirm({
                        eventId: event?.eventId,
                        eventName: event?.eventName,
                        successCallback: unSubscribeOnEvent,
                        isSingleEventInState: true,
                        eventAdmins: event.eventAdmins,
                        eventParticipants: event.eventParticipants
                    })}
                    style={{ color: "#8B0000" }}
                    className="icon" key="unsubscribe" />
            </Tooltip>)
        }


    }
    if ((isUserEventAdmin && AccessToManage(roles.filter(role => role != Roles.RegisteredUser && role != Roles.Supporter))) || roles.includes(Roles.Admin)) {
        if (!isEventFinished && !isUserEventAdmin && !isUserParticipant) {
            SubscribeToEvent();
        }
        else if(!isEventFinished && !isUserEventAdmin && isUserParticipant){
          TrackStatus();
        }
        if (event.eventStatus === "???? ??????????????????????") {
            {
                roles.includes(Roles.Admin) && eventIcons.push(<Tooltip placement="bottom" title="???? ???????????? ???????????????????? ??????????!" key="setting">
                    <SettingTwoTone twoToneColor="#3c5438" onClick={() => showApproveConfirm({
                        eventId: event?.eventId,
                        eventName: event?.eventName,
                        eventStatusId: event?.eventStatus,
                        eventAdmins: event.eventAdmins,
                        setApprovedEvent: setApprovedEvent
                    })} className="icon" key="setting" />
                </Tooltip>)
            }
            eventIcons.push(<Tooltip placement="bottom" title="????????????????????" key="edit" >
                <EditTwoTone twoToneColor="#3c5438" className="icon" key="edit"
                    onClick={() => setVisibleDrawer(true)} />
            </Tooltip>)
            eventIcons.push(<Tooltip placement="bottom" title="????????????????" key="delete">
                <DeleteTwoTone twoToneColor="#8B0000"
                    onClick={() => showDeleteConfirmForSingleEvent({
                        eventId: event?.eventId,
                        eventName: event?.eventName,
                        eventTypeId: event?.eventTypeId,
                        eventCategoryId: event?.eventCategoryId,
                        eventAdmins: event.eventAdmins
                    })}
                    className="icon" key="delete" />
            </Tooltip>)
        }
        else if (event.eventStatus === "??????????????????") {
            eventIcons.push(<Tooltip placement="bottom" title="????????????????" key="delete">
                <DeleteTwoTone twoToneColor="#8B0000"
                    onClick={() => showDeleteConfirmForSingleEvent({
                        eventId: event?.eventId,
                        eventName: event?.eventName,
                        eventTypeId: event?.eventTypeId,
                        eventCategoryId: event?.eventCategoryId,
                        eventAdmins: event.eventAdmins
                    })}
                    className="icon" key="delete" />
            </Tooltip>)
        }
        else if (event.eventStatus === "??????????????????????" && roles.includes(Roles.Admin)) {
            eventIcons.push(<Tooltip placement="bottom" title="????????????????????" key="edit" >
                <EditTwoTone twoToneColor="#3c5438" className="icon" key="edit"
                    onClick={() => setVisibleDrawer(true)} />
            </Tooltip>)
            eventIcons.push(<Tooltip placement="bottom" title="????????????????" key="delete">
                <DeleteTwoTone twoToneColor="#8B0000"
                    onClick={() => showDeleteConfirmForSingleEvent({
                        eventId: event?.eventId,
                        eventName: event?.eventName,
                        eventTypeId: event?.eventTypeId,
                        eventCategoryId: event?.eventCategoryId,
                        eventAdmins: event.eventAdmins
                    })}
                    className="icon" key="delete" />
            </Tooltip>)
        }

    } 
    else if (isUserParticipant && !isEventFinished) {
       TrackStatus();
    } 
    else if (!isEventFinished && AccessToManage(roles.filter(r => r != Roles.RegisteredUser))) {
        SubscribeToEvent();
    }

    eventIcons.push(<Tooltip placement="bottom" title="??????????????????????????(-??) ??????????" key="admins">
        <IdcardOutlined style={{ color: "#3c5438", fontSize: "30px" }} className="icon"
            onClick={() => setAdminsVisibility(true)}
        />
    </Tooltip>)
   return eventIcons
}
const RenderRatingSystem = ({
    event, canEstimate, isEventFinished, participantAssessment
}: EventDetails
): React.ReactNode => {
    if (isEventFinished && canEstimate) {
        return <Rate allowHalf defaultValue={participantAssessment}
            onChange={async (value) => await eventsApi.estimateEvent(event.eventId, value)}
        />
    } else {
        return <Rate allowHalf disabled defaultValue={event.rating} onChange={(value) => console.log(value)} />
    }
}
const RenderAdminCards = (eventAdmins: EventAdmin[], visibleDrawer: any) => {
    const history = useHistory();
    return <List className="event-admin-card"
        grid={{
            gutter: 16,
            xs: 2,
            sm: 2,
            md: 2,
            lg: 2,
            xl: 2,
            xxl: 2,
        }}
        dataSource={eventAdmins}
        renderItem={item => (
            <List.Item>
                <Card
                    hoverable
                    title={item.adminType}
                    cover={<img alt="example" src={EventAdminLogo} />}
                >
                    <div onClick={() => history.push(`/userpage/main/${item.userId}`)}>
                        {item.fullName}
                    </div>
                </Card>
            </List.Item>
        )}
    />
}
const SortedEventInfo = ({ event, setApprovedEvent, subscribeOnEvent, unSubscribeOnEvent, visibleDrawer, setVisibleDrawer }: Props) => {
    const [adminsVisible, setAdminsVisibility] = useState(false);
    const { id } = useParams();
    const { userId } = useParams();
    const [createdEvents, setCreatedEvents] = useState<CreatedEvents[]>([
        new CreatedEvents(),
    ]);
    const [allEvents, setAllEvents] = useState<EventsUser>(new EventsUser());
    const [imageBase64, setImageBase64] = useState<string>();
    const [loading, setLoading] = useState(false);

    const fetchData = async () => {
        await eventUserApi.getEventsUser(userId).then(async (response) => {
            setCreatedEvents(response.data);
            setAllEvents(response.data);
            await userApi
                .getImage(response.data.user.imagePath)
                .then((response: { data: any }) => {
                    setImageBase64(response.data);
                });

            setLoading(true);
        });
    };

      return <Row >
        <Col className="eventActions">
            <img
                className="imgEvent"
                alt="example"
                src="https://www.kindpng.com/picc/m/150-1504140_shaking-hands-png-download-transparent-background-hand-shake.png"
            />
            <div className="iconsFlex">
                {RenderEventIcons(event, setApprovedEvent, setVisibleDrawer, subscribeOnEvent, unSubscribeOnEvent, setAdminsVisibility)}
            </div>
            <div className="rateFlex">
                {RenderRatingSystem(event)}
            </div>
        </Col>
        <Modal
            visible={adminsVisible}
            title='?????????????????????????? ??????????'
            footer={null}
            onCancel={() => {
                setAdminsVisibility(false);
            }}
        >
            {RenderAdminCards(event.event.eventAdmins, visibleDrawer)}

        </Modal>
        <EventEditDrawer
            id={id}
            visibleEventEditDrawer={visibleDrawer}
            setShowEventEditDrawer={setVisibleDrawer}
            onEdit={fetchData}
        />
    </Row>
}
export default SortedEventInfo;
