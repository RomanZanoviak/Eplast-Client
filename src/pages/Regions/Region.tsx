import React, { useEffect, useState } from "react";
import { useHistory, useParams, useRouteMatch } from "react-router-dom";
import {
  Avatar,
  Row,
  Col,
  Button,
  Layout,
  Modal,
  Skeleton,
  Card,
  Tooltip,
  Badge,
  Tag
} from "antd";
import {
  FileTextOutlined,
  EditOutlined,
  PlusSquareFilled,
  DeleteOutlined,
  ContainerOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import moment from "moment";
import {
  getRegionById,
  archiveRegion,
  unArchiveRegion,
  getRegionAdministration,
  getHead,
  getHeadDeputy,
  getRegionFollowers,
  AddAdmin,
  EditAdmin,
  removeRegion,
} from "../../api/regionsApi";
import {
  cityNameOfApprovedMember,
} from "../../api/citiesApi";
import "./Region.less";
import CityDefaultLogo from "../../assets/images/default_city_image.jpg";
import Title from "antd/lib/typography/Title";
import Paragraph from "antd/lib/typography/Paragraph";
import Spinner from "../Spinner/Spinner";
import AddDocumentModal from "./AddDocModal";
import RegionDocument from "../../models/Region/RegionDocument";
import AddNewSecretaryForm from "./AddRegionSecretaryForm";
import userApi from "./../../api/UserApi";
import { getLogo } from "./../../api/citiesApi";
import CheckActiveCitiesForm from "./CheckActiveCitiesForm"
import RegionDetailDrawer from "./RegionsDetailDrawer";
import NotificationBoxApi from "../../api/NotificationBoxApi";
import notificationLogic from "../../components/Notifications/Notification";
import { successfulEditAction, successfulDeleteAction, successfulArchiveAction, successfulUnarchiveAction } from "../../components/Notifications/Messages";
import Crumb from "../../components/Breadcrumb/Breadcrumb";
import PsevdonimCreator from "../../components/HistoryNavi/historyPseudo";
import { Roles } from "../../models/Roles/Roles";
import RegionFollower from "../../models/Region/RegionFollower";
import RegionAdmin from "../../models/Region/RegionAdmin";

const Region = () => {
  const history = useHistory();
  const { url } = useRouteMatch();
  const { id } = useParams();
  const maxMembersDisplayCount = 9;
  const [visibleModal, setVisibleModal] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [photoStatus, setPhotoStatus] = useState(true);
  const [canEdit, setCanEdit] = useState(false);
  const [document, setDocument] = useState<RegionDocument>(new RegionDocument());
  const [documents, setDocuments] = useState<RegionDocument[]>([]);
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
  const [visibleDrawer, setVisibleDrawer] = useState(false);
  const [admins, setAdmins] = useState<RegionAdmin[]>([]);
  const [sixAdmins, setSixAdmins] = useState<RegionAdmin[]>([]);
  const [members, setMembers] = useState<any[]>([
    {
      id: "",
      name: "",
      logo: "",
    },
  ]);
  const [nineMembers, setSixMembers] = useState<any[]>([]);
  const [activeMemberVisibility, setActiveMemberVisibility] = useState<boolean>(false);
  const [followers, setFollowers] = useState<RegionFollower[]>([]);
  const [followersCount, setFollowersCount] = useState<number>();
  const [canCreate, setCanCreate] = useState(false);
  const [photosLoading, setPhotosLoading] = useState<boolean>(false);
  const [regionLogoLoading, setRegionLogoLoading] = useState<boolean>(false);
  const [membersCount, setMembersCount] = useState<number>();
  const [activeCities, setActiveCities] = useState<any[]>([]);
  const [adminsCount, setAdminsCount] = useState<number>();
  const [documentsCount, setDocumentsCount] = useState<number>();
  const [visible, setVisible] = useState<boolean>(false);
  const [activeUserRoles, setActiveUserRoles] = useState<string[]>([]);
  const [isActiveUserRegionAdmin, setIsActiveUserRegionAdmin] = useState<boolean>(false);
  const [isActiveUserFromRegion, setIsActiveUserFromRegion] = useState<boolean>(false);
  const [isActiveRegion, setIsActiveRegion] = useState<boolean>(true);
  const [head, setHead] = useState<any>({
    user: {
      firstName: "",
      lastName: "",
    },
    startDate: "",
    endDate: "",
  });
  const [headDeputy, setHeadDeputy] = useState<any>({
    user: {
      firstName: "",
      lastName: "",
    },
    startDate: "",
    endDate: "",
  });

  const setPhotos = async (members: any[], admins: RegionAdmin[], followers: RegionFollower[]) => {
    for (let i = 0; i < admins.length; i++) {
      admins[i].user.imagePath = (
        await userApi.getImage(admins[i].user.imagePath)
      ).data;
    }
    for (let i = 0; i < members.length; i++) {
      if (members[i].logo !== null) {
        members[i].logo = (await getLogo(members[i].logo)).data;
      } else {
        members[i].logo = CityDefaultLogo;
      }
    }
    for(let i = 0; i < followers.length; i++) {
      if (followers[i].logo === null) {
        followers[i].logo = CityDefaultLogo;
      }
    }
    setPhotosLoading(false);
    setRegionLogoLoading(false);
  };

  const ArchiveRegion = async () => {
    try {
      await archiveRegion(region.id);
    } finally {
    admins.map(async (ad) => {
      await createNotification(ad.userId,
        `???? ???????? ???????????? '${region.regionName}', ?? ???????? ???? ?????????????? ????????: '${ad.adminType.adminTypeName}' ???????? ????????????????.`, false);
    });
    notificationLogic("success", successfulArchiveAction("????????????"));
    history.push("/regions");
  }
  };

  const deleteRegion = async () => {
    await removeRegion(region.id);
    notificationLogic("success", successfulDeleteAction("????????????"));

    history.push("/regions");
  };
  const UnArchiveRegion = async () => {
    await unArchiveRegion(region.id)
    notificationLogic("success", successfulUnarchiveAction("????????????"));

    history.push("/regions");
  };

  function seeArchiveModal() {
    return Modal.confirm({
      title: "???? ????????????????, ???? ???????????? ???????????????????? ???????? ?????????????",
      icon: <ExclamationCircleOutlined />,
      okText: "??????, ????????????????????????",
      okType: "danger",
      cancelText: "??????????????????",
      maskClosable: true,
      onOk() {
        membersCount !== 0 || adminsCount !== 0 || followersCount !== 0
        ? setActiveMemberVisibility(true)
        : ArchiveRegion();
      },
    });
  }

  function seeUnArchiveModal() {
    return Modal.confirm({
      title: "???? ????????????????, ???? ???????????? ?????????????????????????? ???????? ?????????????",
      icon: <ExclamationCircleOutlined />,
      okText: "??????, ??????????????????????????",
      okType: "danger",
      cancelText: "??????????????????",
      maskClosable: true,
      onOk() {
        UnArchiveRegion();
      },
    });
  }
  
  function seeDeleteModal() {
    return Modal.confirm({
      title: "???? ????????????????, ???? ???????????? ???????????????? ???????? ?????????????",
      icon: <ExclamationCircleOutlined />,
      okText: "??????, ????????????????",
      okType: "danger",
      cancelText: "??????????????????",
      maskClosable: true,
      onOk() {
        deleteRegion();
      },
    });
  }

  const setActiveMembers = (cities: any[]) => {
    for (let i = 0; i < cities.length; i++) {
      if (cities[i].cityMembers.length != 0) {
           setActiveCities(activeCities => [...activeCities,  cities[i]])
      }
   } 
  }

  const getRegion = async () => {
    setLoading(true);
    try {
      const regionResponse = await getRegionById(id);
      const regionAdministrationResp = await getRegionAdministration(id);
      const cityNameResp = await cityNameOfApprovedMember(userApi.getActiveUserId());
      const regionFollowersResp = await getRegionFollowers(id);
      const responseHead = await getHead(id);
      const responseHeadDeputy = await getHeadDeputy(id);
      
      setActiveUserRoles(userApi.getActiveUserRoles());
      setHead(responseHead.data);
      setHeadDeputy(responseHeadDeputy.data);
      setMembers(regionResponse.data.cities);
      setActiveMembers(regionResponse.data.cities);
      setMembersCount(regionResponse.data.cities.length);
      getNineMembers(regionResponse.data.cities, maxMembersDisplayCount);
      setDocuments(regionResponse.data.documents);
      setDocumentsCount(regionResponse.data.documentsCount);
      setPhotosLoading(true);
      setAdmins(regionAdministrationResp.data);
      getSixAdmins(regionAdministrationResp.data, 6);
      setAdminsCount(regionAdministrationResp.data.length);
      setIsActiveRegion(regionResponse.data.isActive);
      setRegionLogoLoading(true);
      setPhotos([...regionResponse.data.cities], [...regionAdministrationResp.data], regionFollowersResp.data);
      setRegion(regionResponse.data);
      setCanEdit(regionResponse.data.canEdit);
      setIsFromRegion(regionResponse.data.cities, cityNameResp.data);
      setIsRegionAdmin(regionAdministrationResp.data, userApi.getActiveUserId());
      setSixFollowers(regionFollowersResp.data);
      setFollowers(regionFollowersResp.data);
      setFollowersCount(regionFollowersResp.data.length);

      if (regionResponse.data.logo === null) {
        setPhotoStatus(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const updateAdmins = async () => {
    const regionResponse = await getRegionById(id);
    const regionAdministrationResp = await getRegionAdministration(id);
    const regionFollowersResp = await getRegionFollowers(id);
    const responseHead = await getHead(id);
    const responseHeadDeputy = await getHeadDeputy(id);
    setHead(responseHead.data);
    setHeadDeputy(responseHeadDeputy.data);
    setRegion(regionResponse.data);
    setPhotosLoading(true);
    getSixAdmins(regionAdministrationResp.data, 6);
    setAdminsCount(regionAdministrationResp.data.length);
    setPhotos([...regionResponse.data.cities], [...regionAdministrationResp.data], regionFollowersResp.data);
    if (regionResponse.data.logo === null) {
      setPhotoStatus(false);
    }
  }

  const addRegionAdmin = async (newAdmin: RegionAdmin) => {
    let previousAdmin: RegionAdmin = new RegionAdmin(); 
    admins.map((admin) => {
      if (admin.adminType.adminTypeName == newAdmin.adminType.adminTypeName){
        previousAdmin = admin;
      }
    });
    await AddAdmin(newAdmin);
    await updateAdmins();
    if (previousAdmin.adminType.adminTypeName != ""){
      await createNotification(previousAdmin.userId,
        `???? ????????, ???? ???????? ???????????????????? ????????: '${previousAdmin.adminType.adminTypeName}' ?? ????????????`, true);
    }
    await createNotification(newAdmin.userId,
      `?????? ???????? ?????????????????? ?????????????????????????????? ????????: '${newAdmin.adminType.adminTypeName}' ?? ????????????`, true);
      notificationLogic("success", "???????????????????? ?????????????? ?????????????? ?? ????????????");
  };

  const editRegionAdmin = async (admin: RegionAdmin) => {
    await EditAdmin(admin);
    await updateAdmins();
    notificationLogic("success", successfulEditAction("????????????????????????????"));
    await createNotification(admin.userId,
      `?????? ???????? ?????????????????????????? ?????????????????????????????? ????????: '${admin.adminType.adminTypeName}' ?? ????????????`, true);
  };

  const showConfirm = (newAdmin: RegionAdmin, existingAdmin: RegionAdmin) => {
    Modal.confirm({
      title: "???????????????????? ???????????? ?????????????????????? ???? ???? ?????????????",
      content: (
        <div style={{ margin: 10 }}>
          <b>
            {existingAdmin.user.firstName} {existingAdmin.user.lastName}
          </b>{" "}
          ?????? ?????? ???????? "{existingAdmin.adminType.adminTypeName}", ?????? ?????????????????? ????????????????????????{" "}
          <b>
            {existingAdmin.endDate === null || existingAdmin.endDate === undefined
              ? "???? ???? ??????????"
              : moment(existingAdmin.endDate).format("DD.MM.YYYY")}
          </b>
          .
        </div>
      ),    
      onCancel() { },
      onOk() {
        if (newAdmin.id === 0) {
          addRegionAdmin(newAdmin);
          setAdmins((admins as RegionAdmin[]).map(x => x.userId === existingAdmin?.userId ? newAdmin : x));
        } else {
          editRegionAdmin(newAdmin);
        }
      }
    });
  };

  const handleConfirm = async () => {
    setActiveMemberVisibility(false);
  };

  const handleOk = async(admin: RegionAdmin) => {
    if (admin.id === 0) {
      try {
        const existingAdmin  = (admins as RegionAdmin[])
        .find(x => x.adminType.adminTypeName === admin.adminType.adminTypeName)
        if(existingAdmin !== undefined) {
          showConfirm(admin, existingAdmin);
        }
        else {
          await addRegionAdmin(admin);
        }
      } finally {
        setVisible(false);
      }
    }
    else{
      await editRegionAdmin(admin);
    }
  }

  const handleClose = async() => {
    setVisible(false);
  };

  const setIsFromRegion = (members: any[], city: string) => {
    for (let i = 0; i < members.length; i++){
      if (members[i].name == city){
        setIsActiveUserFromRegion(true);
        return;
      }
    }
  }

  const setIsRegionAdmin = (admins: RegionAdmin[], userId: string) => {
    for (let i = 0; i < admins.length; i++){
      if (admins[i].userId == userId){
        setIsActiveUserRegionAdmin(true);
        return;
      }
    }
  }

  const setSixFollowers = (newfollowers: RegionFollower[]) => {
    if (newfollowers.length !== 0) {
      if (newfollowers.length > 6) {
        for (let i = 0; i < 6; i++) {
          followers[i] = newfollowers[i];
        }
      } else {
        for (let i = 0; i < newfollowers.length; i++) {
          followers[i] = newfollowers[i];
        }
      }  
    }
  };

  const getNineMembers = (member: any[], amount: number) => {
    if (member.length > maxMembersDisplayCount) {
      for (let i = 0; i < amount; i++) {
        nineMembers[i] = member[i];
      }
    } else {
      if (member.length !== 0) {
        for (let i = 0; i < member.length; i++) {
          nineMembers[i] = member[i];
        }
      }
    }
  };

  const getSixAdmins = (admins: RegionAdmin[], amount: number) => {
    if (admins.length > 6) {
      for (let i = 0; i < amount; i++) {
        sixAdmins[i] = admins[i];
      }
    } else {
      if (admins.length !== 0) {
        for (let i = 0; i < admins.length; i++) {
          sixAdmins[i] = admins[i];
        }
      }
    }
  };

  const onAdd =  async (newDocument: RegionDocument) => {
    const response = await getRegionById(id);
    setDocumentsCount(response.data.documentsCount);
    if (documents.length < 6) {
      setDocuments([...documents, newDocument]);
    }
  };

  const createNotification = async(userId: string, message: string, regionExist: boolean) => {
    if(regionExist){  
      await NotificationBoxApi.createNotifications(
        [userId],
        message + ": ",
        NotificationBoxApi.NotificationTypes.UserNotifications,
        `/regions/${id}`,
        region.regionName
        );
    } else {
      await NotificationBoxApi.createNotifications(
        [userId],
        message,
        NotificationBoxApi.NotificationTypes.UserNotifications
      );
    }
  }

  useEffect(() => {
    getRegion();
  }, []);

  useEffect(() => {
    if (region.regionName.length !== 0) {
      PsevdonimCreator.setPseudonimLocation(`regions/${region.regionName}`, `regions/${id}`);
    }
  }, []);

  return loading ? (
    <Spinner />
  ) : (
      <Layout.Content className="cityProfile">
        <Row gutter={[0, 48]}>
          <Col xl={15} sm={24} xs={24}>
            <Card hoverable className="cityCard">
              <div>
                <Crumb
                  current={region.regionName}
                  first="/"
                  second={url.replace(`/${id}`, "")}
                  second_name="????????????"
                />
                  {isActiveRegion ? null : (
                    <Tag className="status" color = {"red"}>
                      ????????????????????????
                    </Tag>
                  )}
              </div>
              <Title level={3}>???????????? {region.regionName}</Title>
              <Row className="cityPhotos" gutter={[0, 12]}>
                <Col md={13} sm={24} xs={24}>
                  {photoStatus ? (
                    <img src={region.logo} alt="Region" className="cityLogo" />
                  ) : (
                      <img
                        src={CityDefaultLogo}
                        alt="Region"
                        className="cityLogo"
                      />
                    )}
                </Col>
                <Col md={{ span: 10, offset: 1 }} sm={24} xs={24}>
                  <iframe
                    src=""
                    title="map"
                    aria-hidden="false"
                    className="mainMap"
                  />
                </Col>
              </Row>
              <Row className="cityInfo">
                <Col md={13} sm={24} xs={24}>
                  {head.user ? (
                    <div>
                      <Paragraph>
                        <b>???????????? ????????????:</b> {head.user.firstName}{" "}
                        {head.user.lastName}
                      </Paragraph>
                      {head.endDate ? (
                        <Paragraph>
                          <b>?????? ??????????????????:</b>{" "}
                          {moment.utc(head.startDate).local().format("DD.MM.YYYY")}{" - "}
                          {moment.utc(head.endDate).local().format("DD.MM.YYYY")}
                        </Paragraph>
                      ) : (
                          <Paragraph>
                            <b>?????????????? ??????????????????:</b>{" "}
                            {moment.utc(head.startDate).local().format("DD.MM.YYYY")}
                          </Paragraph>
                        )}
                    </div>
                  ) : (
                    <Paragraph>
                      <b>???? ?????????? ???????????? ????????????</b>
                    </Paragraph>
                    )}
                    {headDeputy.user ? (
                    <div>
                      <Paragraph>
                        <b>?????????????????? ???????????? ????????????:</b> {headDeputy.user.firstName}{" "}
                        {headDeputy.user.lastName}
                      </Paragraph>
                      {headDeputy.endDate ? (
                        <Paragraph>
                          <b>?????? ??????????????????:</b>{" "}
                          {moment.utc(headDeputy.startDate).local().format("DD.MM.YYYY")}{" - "}
                          {moment.utc(headDeputy.endDate).local().format("DD.MM.YYYY")}
                        </Paragraph>
                      ) : (
                          <Paragraph>
                            <b>?????????????? ??????????????????:</b>{" "}
                            {moment.utc(headDeputy.startDate).local().format("DD.MM.YYYY")}
                          </Paragraph>
                        )}
                    </div>
                  ) : (
                    <Paragraph>
                      <b>???? ?????????? ???????????????????? ???????????? ????????????</b>
                    </Paragraph>
                    )}
                </Col>

                <Col md={{ span: 10, offset: 1 }} sm={24} xs={24}>
                  {region.link || region.email || region.phoneNumber ? (
                    <div>
                      {region.link ? (
                        <Paragraph ellipsis>
                          <b>??????????????????:</b>{" "}
                          <u>
                            <a
                              href={region.link}
                              target="_blank"
                              className="link"
                            >
                              {region.link}
                            </a>
                          </u>
                        </Paragraph>
                      ) : null}
                      {region.phoneNumber ? (
                        <Paragraph>
                          <b>??????????????:</b> {region.phoneNumber}
                        </Paragraph>
                      ) : null}
                      {region.email ? (
                        <Paragraph>
                          <b>??????????:</b> {region.email}
                        </Paragraph>
                      ) : null}
                    </div>
                  ) : (
                      <Paragraph>
                        <b>?????????? ??????????????????</b>
                      </Paragraph>
                    )}
                </Col>
              </Row>
              <Row className="cityButtons" justify="center" gutter={[12, 0]}>
                <Col>
                  <Button
                    type="primary"
                    className="cityInfoButton"
                    onClick={() => setVisibleDrawer(true)}
                  >
                    ????????????
                </Button>
                </Col>

                {canCreate || canEdit ? (
                  <>
                    <Col style={{ display: canCreate || canEdit ? "block" : "none" }}>
                      <Button
                        type="primary"
                        className="cityInfoButton"
                        onClick={() => history.push(`/annualreport/table/country`)}
                      >
                        ?????????? ??????????
                </Button>
                    </Col>
                    <Col xs={24} sm={4} style={{ display: canEdit && ( isActiveUserRegionAdmin
                      || activeUserRoles.includes(Roles.Admin)) ? "block" : "none" }}>
                      <Row
                        className="cityIcons"
                        justify={canCreate ? "center" : "start"}
                      >
                        <Col>
                          <Tooltip title="???????????????????? ????????????">
                            <EditOutlined
                              className="cityInfoIcon"
                              onClick={() =>
                                history.push(`/regions/edit/${region.id}`)
                              }
                            />
                          </Tooltip>
                        </Col>
                        {activeUserRoles.includes(Roles.Admin) ? (
                          isActiveRegion ? (
                            <Col offset={1}>
                              <Tooltip title="???????????????????????? ????????????">
                                <ContainerOutlined
                                  className="cityInfoIconDelete"
                                  onClick={() => seeArchiveModal()} 
                                />
                              </Tooltip>
                            </Col>
                          ) : (
                              <React.Fragment>
                                <Col offset={1}>
                                  <Tooltip title="???????????????? ????????????">
                                    <DeleteOutlined
                                      className="cityInfoIconDelete"
                                      onClick={() => seeDeleteModal()} 
                                    />
                                  </Tooltip>
                                </Col>
                                <Col offset={1}>
                                  <Tooltip title="?????????????????????????? ????????????">
                                    <ContainerOutlined
                                      className="cityInfoIcon"
                                      color = "green" 
                                      onClick={() => seeUnArchiveModal()} 
                                    />
                                  </Tooltip>
                                </Col>
                              </React.Fragment>
                          )
                        ) : null}
                      </Row>
                    </Col>
                  </>
                ) : null}
              </Row>
            </Card>
          </Col>

          <Col xl={{ span: 7, offset: 1 }} md={11} sm={24} xs={24}>
            <Card hoverable className="cityCard">
              <Title level={4}>?????????? ???????????? <a onClick={() => history.push(`/regions/members/${id}`)}>
                {membersCount !== 0 ?
                  <Badge
                    count={membersCount}
                    style={{ backgroundColor: "#3c5438" }}
                  /> : null
                }
                </a>
              </Title>
              <Row className="cityItems" justify="center" gutter={[0, 16]}>
                {members.length !== 0 ? (
                  nineMembers.map((member) => (
                    <Col
                      className="cityMemberItem"
                      key={member.id}
                      xs={12}
                      sm={8}
                    >
                      <div onClick={() => history.push(`/cities/${member.id}`)}>
                        {photosLoading ? (
                          <Skeleton.Avatar active size={64}></Skeleton.Avatar>
                        ) : (
                            <Avatar size={64} src={member.logo} />
                          )}
                        <p className="userName">{member.name}</p>
                      </div>
                    </Col>
                  ))
                ) : (
                    <Paragraph>???? ?????????? ???????????? ????????????</Paragraph>
                  )}
              </Row>
              <div className="cityMoreButton">
                <Button
                  type="primary"
                  className="cityInfoButton"
                  onClick={() => history.push(`/regions/members/${id}`)}
                >
                  ????????????
              </Button>
              </div>
            </Card>
          </Col>

          <Col
            xl={{ span: 7, offset: 0 }}
            md={{ span: 11, offset: 2 }}
            sm={24}
            xs={24}
          >
            <Card hoverable className="cityCard">
              <Title level={4}>???????????? ???????????? <a onClick={() => history.push(`/region/administration/${region.id}`)}>
                {adminsCount !== 0 ?
                  <Badge
                    count={adminsCount}
                    style={{ backgroundColor: "#3c5438" }}
                  /> : null
                }
              </a>
              </Title>
              <Row className="cityItems" justify="center" gutter={[0, 16]}>
                {adminsCount !== 0 ? (
                  sixAdmins.map((admin) => (
                    <Col className="cityMemberItem" key={admin.id} xs={12} sm={8}>
                      <div
                        onClick={() =>
                          !activeUserRoles.includes(Roles.RegisteredUser)
                          ? history.push(`/userpage/main/${admin.userId}`)
                          : undefined
                        }
                      >
                        {photosLoading ? (
                          <Skeleton.Avatar active size={64}></Skeleton.Avatar>
                        ) : (
                            <Avatar size={64} src={admin.user.imagePath} />
                          )}
                        <p className="userName">{admin.user.firstName}</p>
                        <p className="userName">{admin.user.lastName}</p>
                      </div>
                    </Col>
                  ))
                ) : (
                    <Paragraph>???? ?????????? ?????????????????? ????????????</Paragraph>
                  )}
              </Row>
              <div className="cityMoreButton">
                {isActiveRegion ? (
                canEdit && (activeUserRoles.includes(Roles.Admin) || isActiveUserRegionAdmin) 
                ?(
                  <PlusSquareFilled
                    type="primary"
                    className="addReportIcon"
                    onClick={() => setVisible(true)}
                  />
                ) : null) : null}
                <Button
                  type="primary"
                  className="cityInfoButton"
                  onClick={() =>
                    history.push(`/region/administration/${region.id}`)
                  }
                >
                  ????????????
              </Button>
              </div>
            </Card>
          </Col>

          <Col
            xl={{ span: 7, offset: 1 }}
            md={11}
            sm={24}
            xs={24}
          >
            <Card hoverable className="cityCard">
              <Title level={4}>?????????????????????????? ???????????? <a onClick={() => 
                 canEdit || activeUserRoles.includes(Roles.KurinHead) || activeUserRoles.includes(Roles.CityHead)
                 || activeUserRoles.includes(Roles.CityHeadDeputy) || activeUserRoles.includes(Roles.KurinHeadDeputy)
                 || (!activeUserRoles.includes(Roles.RegisteredUser) && isActiveUserFromRegion)
                 ? 
                history.push(`/regions/documents/${region.id}`)
                : undefined
              }>
              {documentsCount !== 0 ?
                <Badge
                  count={documentsCount}
                  style={{ backgroundColor: "#3c5438" }}
                /> : null
              }
            </a>
              </Title>
              <Row className="cityItems" justify="center" gutter={[0, 16]}>
                {documents.length !== 0 ? (
                  documents.map((document) => (
                    <Col
                      className="cityDocumentItem"
                      xs={12}
                      sm={8}
                      key={document.id}
                    >
                      <div>
                        <FileTextOutlined className="documentIcon" />
                        <p className="documentText">{document.fileName}</p>
                      </div>
                    </Col>
                  ))
                ) : (
                    <Paragraph>???? ?????????? ???????????????????? ????????????</Paragraph>
                  )}
              </Row>
              <div className="cityMoreButton">
                {
                  canEdit || activeUserRoles.includes(Roles.KurinHead) || activeUserRoles.includes(Roles.CityHead)
                  || activeUserRoles.includes(Roles.CityHeadDeputy) || activeUserRoles.includes(Roles.KurinHeadDeputy)
                  || (!activeUserRoles.includes(Roles.RegisteredUser) && isActiveUserFromRegion)
                  ? <Button
                      type="primary"
                      className="cityInfoButton"
                      onClick={() => history.push(`/regions/documents/${region.id}`)}
                    > 
                      ????????????
                    </Button>
                  : null
                }
                {isActiveRegion ? (
                activeUserRoles.includes(Roles.Admin)
                || ((activeUserRoles.includes(Roles.OkrugaHead) || activeUserRoles.includes(Roles.OkrugaHeadDeputy)) 
                    && isActiveUserRegionAdmin)
                ?(
                <PlusSquareFilled
                  className="addReportIcon"
                  onClick={() => setVisibleModal(true)}
                />
                ):null) : null}
              </div>
            </Card>
          </Col>

          <Col
            xl={{ span: 7, offset: 1 }}
            md={{ span: 11, offset: 2 }}
            sm={24}
            xs={24}
          >
            <Card hoverable className="cityCard">
              <Title level={4}>?????????????????????? ???????????? <a onClick={() => history.push(`/regions/followers/${region.id}`)}>
                {followersCount !== 0 ?
                  <Badge
                    count={followersCount}
                    style={{ backgroundColor: "#3c5438" }}
                  /> : null
                }
                </a>
              </Title>
              <Row className="cityItems" justify="center" gutter={[0, 16]}>
                {followers.length !== 0 ? (
                  followers.slice(0, 6).map((follower) => (
                    <Col
                      className={activeUserRoles.includes(Roles.Admin) ? "cityMemberItem" : undefined}
                      xs={12}
                      sm={8}
                      key={follower.id}
                    >
                    <div>
                      <div
                        onClick={() => activeUserRoles.includes(Roles.Admin) 
                          ? history.push(`/regions/follower/edit/${follower.id}`)
                          : undefined
                        }
                      >
                        {photosLoading ? (
                          <Skeleton.Avatar active size={64}></Skeleton.Avatar>
                        ) : (
                            <Avatar size={64} src={follower.logo} />
                          )}
                        <p className="userName">{follower.cityName}</p>
                      </div>
                    </div>
                    </Col>
                  ) )
                ) 
                : (
                    <Paragraph>???? ?????????? ???????????????????????? ????????????</Paragraph>
                  )}
              </Row>
              <div className="cityMoreButton">
                <Button
                  type="primary"
                  className="cityInfoButton"
                  onClick={() => history.push(`/regions/followers/${region.id}`)}
                >
                ????????????
                </Button>
              </div>
            </Card>
          </Col>
        </Row>

        <AddDocumentModal
          regionId={+id}
          document={document}
          setDocument={setDocument}
          visibleModal={visibleModal}
          setVisibleModal={setVisibleModal}
          onAdd={onAdd}
        ></AddDocumentModal>

        <Modal
          title="???????????? ????????????????"
          visible={visible}
          onCancel={handleClose}
          footer={null}
        >
          <AddNewSecretaryForm 
              onAdd={handleOk}
              head={head}
              headDeputy={headDeputy}
              regionId={region.id}
              visibleModal={visible}
          >
          </AddNewSecretaryForm>
        </Modal>

        <Modal
          title="???? ???????? ???? ???? ???????????? ???????????????????? ?????????????????? ????????????"
          visible={activeMemberVisibility}
          onOk={handleConfirm}
          onCancel={handleConfirm}
          footer={null}
        >
          <CheckActiveCitiesForm cities = {activeCities} admins = {admins} followers = {followers}  onAdd={handleConfirm} />
        </Modal>

        <RegionDetailDrawer
          region={region}
          setVisibleDrawer={setVisibleDrawer}
          visibleDrawer={visibleDrawer}
        ></RegionDetailDrawer>
      </Layout.Content>
    );
};

export default Region;