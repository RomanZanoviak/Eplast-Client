import { Button, Layout, List } from "antd";
import React, { useEffect } from "react";
import { useState } from "react";
import { addAnnouncement, editAnnouncement, getAllAnnouncements, getAllUserId } from "../../../api/governingBodiesApi";
import { getUsersByAnyRole, getUsersByAllRoles } from "../../../api/adminApi";
import { Announcement } from "../../../models/GoverningBody/Announcement/Announcement";
import AddAnnouncementModal from "./AddAnnouncementModal";
import Spinner from "../../Spinner/Spinner";
import { AnnouncementForAdd } from "../../../models/GoverningBody/Announcement/AnnouncementForAdd";
import DropDown from "./DropDownAnnouncement";
import ClickAwayListener from "react-click-away-listener";
import NotificationBoxApi from "../../../api/NotificationBoxApi";
import EditAnnouncementModal from "./EditAnnouncementModal";
import { getUserAccess } from "../../../api/regionsBoardApi";
import { Roles } from '../../../models/Roles/Roles';
import jwt from 'jwt-decode';
import AuthStore from "../../../stores/AuthStore";
import ShortUserInfo from "../../../models/UserTable/ShortUserInfo";


const { Content } = Layout;

const Announcements = () => {
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [showDropdown, setShowDropdown] = useState(false);
  const [data, setData] = useState<Array<Announcement>>([]);
  const [newData, setNewData] = useState<Array<Announcement>>([]);
  const [recordObj, setRecordObj] = useState<number>(0);
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [visibleAddModal, setVisibleAddModal] = useState(false);
  const [visibleEditModal, setVisibleEditModal] = useState(false);
  const [activeUserId, setActiveUserId] = useState<string>("");
  const classes = require("./Announcement.module.css");
  const [userAccesses, setUserAccesses] = useState<{[key: string] : boolean}>({});

  const getAnnouncements = async () => {
    setLoading(true);
    await getAllAnnouncements()
    .then((res) => {
      var announcements: Announcement[] = [];
      for (var value of res.data) {
        var ann: Announcement = {
          id: value.id,
          text: value.text,
          date: value.date,
          firstName: value.user.firstName,
          lastName: value.user.lastName,
          userId: value.userId,
        };
        announcements.push(ann);
      }
      setData(announcements);
      setLoading(false);
    });
  };

  const getUserAccesses = async () => {
    let user: any = jwt(AuthStore.getToken() as string);
    let result :any
    await getUserAccess(user.nameid).then(
      response => {
        result = response
        setUserAccesses(response.data);
      }
    );
    return result
  }

  const getUsers = async () => {
    let prohibitedUsers = [Roles.RegisteredUser];
    let result: any
    await getUsersByAllRoles(prohibitedUsers,false).then(
      response => {
      result = response
    });
    return result;
  }
  useEffect(() => {
    getUserAccesses();
    getAnnouncements();
  }, []);

  const handleClickAway = () => {
    setShowDropdown(false);
  };

  const newNotification = async () => {
    let usersId = ((await getUsers()).data as ShortUserInfo[]).map(x => x.id)
    await NotificationBoxApi.createNotifications(
      usersId,
      "???????????? ???????? ????????????????????.",
      NotificationBoxApi.NotificationTypes.UserNotifications,
      `/announcements`,
      `??????????????????????`
    );
  };

  const showModal = () => {
    setVisibleAddModal(true);
  };

  const handleEdit = async (id: number, ann: Announcement) => {
    setVisibleAddModal(false);
    setLoading(true);
    await editAnnouncement(id,ann);
    setData(data.map(x => x.id == id ? ann: x))
    setLoading(false);
  }
  const handleAdd = async (str: string) => {
    setVisibleAddModal(false);
    setLoading(true);
    newNotification();
    await addAnnouncement(str)
    await getAnnouncements();
    setLoading(false);
  };

  const handleDelete = (id: number) => {
    const filteredData = data.filter((d) => d.id !== id);
    setData([...filteredData]);
  };

  return (
    <Layout>
      <Content
        onClick={() => {
          setShowDropdown(false);
        }}
      >
        <h1> ???????????????????? </h1>
        {userAccesses["AddAnnouncement"] ?
          <div className={classes.antbtn}>
            <Button type="primary" onClick={showModal}>
              ???????????? ????????????????????
            </Button>
          </div>
        : null
      }
        {loading ? (
          <Spinner />
        ) : (
          <List
            itemLayout="horizontal"
            dataSource={data}
            renderItem={(item) => (
              <List.Item
              style={{overflow:"hidden", wordBreak:"break-word"}}
                className={classes.listItem}
                onClick={() => {
                  setShowDropdown(false);
                }}
                onContextMenu={(event) => {
                  event.preventDefault();
                  setShowDropdown(true);
                  setRecordObj(item.id);
                  setX(event.pageX);
                  setY(event.pageY);
                }}
              >
                <List.Item.Meta
                  title={item.firstName + " " + item.lastName}
                  description={item.date.toString().substring(0, 10)}
                />
                {item.text}
              </List.Item>
            )}
            pagination={{
              showLessItems: true,
              responsive: true,
              showSizeChanger: true,
            }}
          />
        )}
        <ClickAwayListener onClickAway={handleClickAway}>
          <DropDown
            showDropdown={showDropdown}
            record={recordObj}
            pageX={x}
            pageY={y}
            onDelete={handleDelete}
            onEdit = {() => {setVisibleEditModal(true)}}
            userAccess={userAccesses}
          />
        </ClickAwayListener>
        <AddAnnouncementModal
          setVisibleModal={setVisibleAddModal}
          visibleModal={visibleAddModal}
          onAdd={handleAdd}
        />
        <EditAnnouncementModal
          setVisibleModal={setVisibleEditModal}
          visibleModal={visibleEditModal}
          onEdit={handleEdit}
          id={recordObj}
        />
      </Content>
    </Layout>
  );
};

export default Announcements;
