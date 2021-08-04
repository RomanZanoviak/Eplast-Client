import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { Avatar, Button, Card, Layout, Modal, Skeleton, Spin } from "antd";
import {
  SettingOutlined,
  CloseOutlined,
  RollbackOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { getRegionAdministration, removeAdmin } from "../../api/regionsApi";
import userApi from "../../api/UserApi";
import "./Region.less";
import moment from "moment";
import "moment/locale/uk";
import Title from "antd/lib/typography/Title";
import Spinner from "../Spinner/Spinner";
import CityAdmin from "../../models/City/CityAdmin";
import NotificationBoxApi from "../../api/NotificationBoxApi";
import AddNewSecretaryForm from "./AddRegionSecretaryForm";
import { Roles } from "../../models/Roles/Roles";
moment.locale("uk-ua");

const RegionAdministration = () => {
  const { id } = useParams();
  const history = useHistory();

  const [administration, setAdministration] = useState<any[]>([
    {
      id: "",
      user: {
        firstName: "",
        lastName: "",
        imagePath: "",
      },
      adminType: {
        adminTypeName: "",
      },
      startDate: "",
      endDate: "",
    },
  ]);
  const [visibleModal, setVisibleModal] = useState(false);
  const [admin, setAdmin] = useState<CityAdmin>(new CityAdmin());
  const [photosLoading, setPhotosLoading] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [reload, setReload] = useState(false);
  const [activeUserRoles, setActiveUserRoles] = useState<string[]>([]);
  const [isActiveUserRegionAdmin, setIsActiveUserRegionAdmin] = useState<boolean>(false);

  const setIsRegionAdmin = (admin: any[], userId: string) => {
    for(let i = 0; i < admin.length; i++){
      if(admin[i].userId == userId){
        setIsActiveUserRegionAdmin(true);
      }
    }
  }

  const getAdministration = async () => {
    setLoading(true);
    const response = await getRegionAdministration(id);
    setPhotosLoading(true);
    setPhotos([...response.data].filter((a) => a != null));
    setAdministration([...response.data].filter((a) => a != null));
    setActiveUserRoles(userApi.getActiveUserRoles());
    setIsRegionAdmin([...response.data].filter((a) => a != null), userApi.getActiveUserId());
    setLoading(false);
  };

  function seeDeleteModal(admin: CityAdmin) {
    return Modal.confirm({
      title: "Ви впевнені, що хочете видалити даного користувача із Проводу?",
      icon: <ExclamationCircleOutlined />,
      okText: "Так, Видалити",
      okType: "primary",
      cancelText: "Скасувати",
      maskClosable: true,
      onOk() {
        removeAdministrator(admin);
      },
    });
  }

  const removeAdministrator = async (admin: CityAdmin) => {
    await removeAdmin(admin.id);
    await NotificationBoxApi.createNotifications(
      [admin.userId],
      `Вас було позбавлено адміністративної ролі: '${admin.adminType.adminTypeName}' в `,
      NotificationBoxApi.NotificationTypes.UserNotifications,
      `/regions/${id}`,
      `цій окрузі`
    );
    setAdministration(administration.filter((u) => u.id !== admin.id));
  };

  const showModal = (member: any) => {
    setAdmin(member);
    setVisibleModal(true);
  };

  const handleOk = () => {
    setVisibleModal(false);
    setReload(!reload);
  };

  const onAdd = async (newAdmin: any) => {
    const index = administration.findIndex((a) => a.id === admin.id);
    administration[index] = newAdmin;
    await NotificationBoxApi.createNotifications(
      [newAdmin.userId],
      `Вам було надано нову адміністративну роль: '${newAdmin.adminType.adminTypeName}' в `,
      NotificationBoxApi.NotificationTypes.UserNotifications,
      `/regions/${id}`,
      `цій окрузі`
    );
    setAdministration(administration);
  };

  const setPhotos = async (members: any[]) => {
    for (let i of members) {
      i.user.imagePath = (await userApi.getImage(i.user.imagePath)).data;
    }

    setPhotosLoading(false);
  };

  useEffect(() => {
    getAdministration();
  }, [reload]);

  return (
    <Layout.Content>
      <Title level={2}>Провід округи</Title>
      {loading ? (
        <Spinner />
      ) : (
        <div className="cityMoreItems">
          {administration.length > 0 ? (
            administration.map((member: any) => (
              <Card
                key={member.id}
                className="detailsCard"
                title={`${member.adminType.adminTypeName}`}
                headStyle={{ backgroundColor: "#3c5438", color: "#ffffff" }}          
                actions={
                  activeUserRoles.includes(Roles.Admin) || (activeUserRoles.includes(Roles.OkrugaHead) && isActiveUserRegionAdmin)
                  || ((!activeUserRoles.includes(Roles.OkrugaHeadDeputy) || member.adminType.adminTypeName !== Roles.OkrugaHead)
                  && isActiveUserRegionAdmin)
                  ?
                  [
                  <SettingOutlined onClick={() => showModal(member)} />,
                  <CloseOutlined onClick={() => seeDeleteModal(member)} />,
                  ]
                  : undefined
                }
              >
                <div
                  onClick={() =>
                    !activeUserRoles.includes(Roles.RegisteredUser)
                    ? history.push(`/userpage/main/${member.userId}`)
                    : undefined 
                  }
                  className="cityMember"
                >
                  <div>
                    {photosLoading ? (
                      <Skeleton.Avatar active size={86}></Skeleton.Avatar>
                    ) : (
                      <Avatar size={86} src={member.user.imagePath} />
                    )}
                    <Card.Meta
                      className="detailsMeta"
                      title={`${member.user.firstName} ${member.user.lastName}`}
                    />
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Title level={4}>Ще немає діловодів округи</Title>
          )}
        </div>
      )}
      <div className="cityMoreItems">
        <Button
          className="backButton"
          icon={<RollbackOutlined />}
          size={"large"}
          onClick={() => history.goBack()}
          type="primary"
        >
          Назад
        </Button>
      </div>

      <Modal
        title="Редагувати діловода"
        visible={visibleModal}
        onOk={handleOk}
        onCancel={handleOk}
        footer={null}
      >
        <AddNewSecretaryForm
          onAdd={handleOk}
          admin={admin} 
        ></AddNewSecretaryForm>
      </Modal>
    </Layout.Content>
  );
};

export default RegionAdministration;
