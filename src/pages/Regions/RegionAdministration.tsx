import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { Avatar, Button, Card, Layout, Modal, Skeleton } from "antd";
import {
  SettingOutlined,
  CloseOutlined,
  RollbackOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { 
  getRegionAdministration, 
  getRegionById, 
  removeAdmin, 
} from "../../api/regionsApi";
import userApi from "../../api/UserApi";
import "./Region.less";
import moment from "moment";
import "moment/locale/uk";
import Title from "antd/lib/typography/Title";
import Spinner from "../Spinner/Spinner";
import CityAdmin from "../../models/City/CityAdmin";
import NotificationBoxApi from "../../api/NotificationBoxApi";
import AddAdministratorModal from "./AddAdministratorModal";
import { Roles } from "../../models/Roles/Roles";
import RegionAdmin from "../../models/Region/RegionAdmin";
import extendedTitleTooltip, { parameterMaxLength } from "../../components/Tooltip";
moment.locale("uk-ua");

const adminTypeNameMaxLength = 22;
const RegionAdministration = () => {
  const { id } = useParams();
  const history = useHistory();

  const [region, setRegion] = useState<any>({
    id: "",
    regionName: "",
    description: "",
    logo: "",
    administration: [{}],
    cities: [{}],
    phoneNumber: "",
    email: "",
    link: "",
    documents: [{}],
    postIndex: "",
    city: "",
  });
  const [administration, setAdministration] = useState<RegionAdmin[]>([]);
  const [visibleModal, setVisibleModal] = useState(false);
  const [admin, setAdmin] = useState<RegionAdmin>(new RegionAdmin());
  const [photosLoading, setPhotosLoading] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [reload, setReload] = useState(false);
  const [regionName, setRegionName] = useState<string>("");
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
    const regionResponse = await getRegionById(id);
    const administrationResponse = await getRegionAdministration(id);
    setPhotosLoading(true);
    setRegion(regionResponse.data);
    setRegionName(regionResponse.data.name);
    setPhotos([...administrationResponse.data].filter((a) => a != null));
    setAdministration([...administrationResponse.data].filter((a) => a != null));
    setActiveUserRoles(userApi.getActiveUserRoles());
    setIsRegionAdmin([...administrationResponse.data].filter((a) => a != null), userApi.getActiveUserId());
    setLoading(false);
  };

  function seeDeleteModal(admin: CityAdmin) {
    return Modal.confirm({
      title: "???? ????????????????, ???? ???????????? ???????????????? ???????????? ?????????????????????? ???? ???????????????",
      icon: <ExclamationCircleOutlined />,
      okText: "??????, ????????????????",
      okType: "primary",
      cancelText: "??????????????????",
      maskClosable: true,
      onOk() {
        removeAdministrator(admin);
      },
    });
  }

  const removeAdministrator = async (admin: CityAdmin) => {
    await removeAdmin(admin.id);
    await createNotification(admin.userId,
      `?????? ???????? ???????????????????? ???????????????????????????????? ????????: '${admin.adminType.adminTypeName}' ?? ????????????`);
    setAdministration(administration.filter((u) => u.id !== admin.id));
  };

  const showModal = (member: RegionAdmin) => {
    setAdmin(member);
    setVisibleModal(true);
  };

  const onAdd = async (newAdmin: RegionAdmin = new RegionAdmin()) => {
    const index = administration.findIndex((a) => a.id === admin.id);
    administration[index] = newAdmin;
    await createNotification(newAdmin.userId, `?????? ???????? ?????????????????? ???????? ????????: '${newAdmin.adminType.adminTypeName}' ?? ????????????`);
    setAdministration(administration);
    setReload(!reload);
  };

  const setPhotos = async (members: any[]) => {
    for (let i of members) {
      i.user.imagePath = (await userApi.getImage(i.user.imagePath)).data;
    }

    setPhotosLoading(false);
  };

  const createNotification = async(userId: string, message: string) => {
    await NotificationBoxApi.createNotifications(
      [userId],
      message + ": ",
      NotificationBoxApi.NotificationTypes.UserNotifications,
      `/regions/${id}`,
      regionName
    );
  }

  useEffect(() => {
    getAdministration();
  }, [reload]);

  return (
    <Layout.Content>
      <Title level={2}>???????????? ????????????</Title>
      {loading ? (
        <Spinner />
      ) : (
        <div className="cityMoreItems">
          {administration.length > 0 ? (
            administration.map((member: any) => (
              <Card
                key={member.id}
                className="detailsCard"
                title={
                  extendedTitleTooltip(adminTypeNameMaxLength, `${member.adminType.adminTypeName}`)
                }
                headStyle={{ backgroundColor: "#3c5438", color: "#ffffff" }}          
                actions={
                  activeUserRoles.includes(Roles.Admin) || (activeUserRoles.includes(Roles.OkrugaHead) && isActiveUserRegionAdmin)
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
                      title={
                        extendedTitleTooltip(parameterMaxLength, `${member.user.firstName} ${member.user.lastName}`)
                      }
                    />
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Title level={4}>???? ?????????? ?????????????????? ????????????</Title>
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
          ??????????
        </Button>
      </div>

          <AddAdministratorModal
            admin={admin}
            setAdmin={setAdmin}
            visibleModal={visibleModal}
            setVisibleModal={setVisibleModal}
            regionId={+id}
            regionName={region}
            onAdd={onAdd}
          />
    </Layout.Content>
  );
};

export default RegionAdministration;
