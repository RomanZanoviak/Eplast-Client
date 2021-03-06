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
  UserAddOutlined,
  PlusOutlined,
  ContainerOutlined,
  ExclamationCircleOutlined,
  DeleteOutlined,
  MinusOutlined,
  LoadingOutlined
} from "@ant-design/icons";
import moment from "moment";
import {
  addAdministrator,
  addFollower,
  cityNameOfApprovedMember,
  editAdministrator,
  getCityById,
  getLogo,
  archiveCity,
  unArchiveCity,
  removeCity,
  toggleMemberStatus,
  removeFollower
} from "../../../api/citiesApi";
import userApi from "../../../api/UserApi";
import "./City.less";
import CityDefaultLogo from "../../../assets/images/default_city_image.jpg";
import CityProfile from "../../../models/City/CityProfile";
import CityMember from "../../../models/City/CityMember";
import CityAdmin from "../../../models/City/CityAdmin";
import CityDocument from "../../../models/City/CityDocument";
import AddDocumentModal from "../AddDocumentModal/AddDocumentModal";
import CheckActiveMembersForm from "./CheckActiveMembersForm";
import Title from "antd/lib/typography/Title";
import Paragraph from "antd/lib/typography/Paragraph";
import Spinner from "../../Spinner/Spinner";
import CityDetailDrawer from "../CityDetailDrawer/CityDetailDrawer";
import notificationLogic from "../../../components/Notifications/Notification";
import Crumb from "../../../components/Breadcrumb/Breadcrumb";
import NotificationBoxApi from "../../../api/NotificationBoxApi";
import { successfulDeleteAction, fileIsAdded, successfulEditAction, successfulUnarchiveAction, successfulArchiveAction } from "../../../components/Notifications/Messages";
import PsevdonimCreator from "../../../components/HistoryNavi/historyPseudo";
import AddCitiesNewSecretaryForm from "../AddAdministratorModal/AddCitiesSecretaryForm";
import { Roles } from "../../../models/Roles/Roles";
import "moment/locale/uk";
import { number } from "yup";

const City = () => {
  const history = useHistory();
  const { id } = useParams();
  const { url } = useRouteMatch();
  const [loading, setLoading] = useState(false);
  const [city, setCity] = useState<CityProfile>(new CityProfile());
  const [cityLogo64, setCityLogo64] = useState<string>("");
  const [visibleModal, setVisibleModal] = useState(false);
  const [visibleDrawer, setVisibleDrawer] = useState(false);
  const [admins, setAdmins] = useState<CityAdmin[]>([]);
  const [members, setMembers] = useState<CityMember[]>([]);
  const [followers, setFollowers] = useState<CityMember[]>([]);
  const [documents, setDocuments] = useState<CityDocument[]>([]);
  const [canCreate, setCanCreate] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [canJoin, setCanJoin] = useState(false);
  const [photosLoading, setPhotosLoading] = useState<boolean>(false);
  const [membersCount, setMembersCount] = useState<number>();
  const [adminsCount, setAdminsCount] = useState<number>();
  const [followersCount, setFollowersCount] = useState<number>();
  const [documentsCount, setDocumentsCount] = useState<number>();
  const [cityLogoLoading, setCityLogoLoading] = useState<boolean>(false);
  const [visible, setvisible] = useState<boolean>(false);
  const [document, setDocument] = useState<CityDocument>(new CityDocument());
  const [activeUserRoles, setActiveUserRoles] = useState<string[]>([]);
  const [activeUserCity, setActiveUserCity] = useState<string>();
  const [activeMemberVisibility, setActiveMemberVisibility] = useState<boolean>(false);
  const [isActiveCity, setIsActiveCity] = useState<boolean>(true);
  const [isLoadingPlus, setIsLoadingPlus] = useState<boolean>(true);
  const [isLoadingMemberId, setIsLoadingMemberId] = useState<number>(0);
  const [activeUserID, setActiveUserID] = useState<string>();
  const documentsToShow = 6;
  const adminsToShow = 6;
  const membersToShow = 9;
  const followersToShow = 5;
  const followersToShowOnAdd = 6;

  const changeApproveStatus = async (memberId: number) => {
    setIsLoadingMemberId(memberId)
    setIsLoadingPlus(false)
    const member = await toggleMemberStatus(memberId);
    moment.locale("uk-ua");

    await createNotification(member.data.userId,
      "??????????????, ?????? ???????????????????? ???? ???????????? ??????????????", true);

    if (member.data.wasInRegisteredUserRole) {
      await createNotification(member.data.userId, "???????? ???????????? ???????? ????????: '????????????????????' ?? ??????????????", true);
    }

    member.data.user.imagePath = (
      await userApi.getImage(member.data.user.imagePath)
    ).data;
    const response = await getCityById(+id);
    setMembersCount(response.data.memberCount);
    setFollowersCount(response.data.followerCount);
    if (members.length < 9) {
      setMembers([...members, member.data]);
    }
    setFollowers(followers.filter((f) => f.id !== memberId));
    setIsLoadingPlus(true)
  };

  const removeMember = async (followerID: number) => {
    await removeFollower(followerID);
    await createNotification(activeUserID as string, "???? ????????, ???? ???????? ?????????????????? ???? ???????????????????????? ??????????????", true);
    const response = await getCityById(+id);
    setFollowersCount(response.data.followerCount);
    setFollowers(followers.filter((f) => f.id !== followerID));
    setCanJoin(true);
  }

  const addMember = async () => {
    const follower = await addFollower(+id);

    if (city.head !== null) {
      await createNotification(city.head.userId,
        `?????????? ???????????????????? ${follower.data.user.firstName} ${follower.data.user.lastName} ???????????????????? ???? ?????????? ??????????????`, true);
    }
    if (city.headDeputy !== null) {
      await createNotification(city.headDeputy.userId,
        `?????????? ???????????????????? ${follower.data.user.firstName} ${follower.data.user.lastName} ???????????????????? ???? ?????????? ??????????????`, true);
    }
    follower.data.user.imagePath = (
      await userApi.getImage(follower.data.user.imagePath)
    ).data;
    const response = await getCityById(+id);
    setFollowersCount(response.data.followerCount);
    if (followers.length < 6) {
      setFollowers([...followers, follower.data]);
    }
    setCanJoin(false);
  };

  const ArchiveCity = async () => {
    await archiveCity(city.id);
    notificationLogic("success", successfulArchiveAction("??????????????"));
    admins.map(async (ad) => {
      await createNotification(ad.userId,
        `???? ???????? ?????????????? '${city.name}', ?? ???????? ???? ?????????????? ????????: '${ad.adminType.adminTypeName}' ???????? ????????????????????????.`, false);
    });
    history.push("/cities");
  };

  const deleteCity = async () => {
    await removeCity(city.id);
    notificationLogic("success", successfulDeleteAction("??????????????"));

    history.push("/cities");
  };

  const UnArchiveCity = async () => {
    await unArchiveCity(city.id)
    notificationLogic("success", successfulUnarchiveAction("??????????????"));

    history.push("/cities");
  };

  const setPhotos = async (members: CityMember[], logo: string) => {
    for (let i = 0; i < members.length; i++) {
      members[i].user.imagePath = (
        await userApi.getImage(members[i].user.imagePath)
      ).data;
    }
    setPhotosLoading(false);

    if (logo === null) {
      setCityLogo64(CityDefaultLogo);
    } else {
      const response = await getLogo(logo);
      setCityLogo64(response.data);
    }
    setCityLogoLoading(false);
  };

  const onAdd = async (newDocument: CityDocument) => {
    const response = await getCityById(+id);
    setDocumentsCount(response.data.documentsCount);
    if (documents.length < 6) {
      setDocuments([...documents, newDocument]);
    }
    notificationLogic("success", fileIsAdded());
  };

  function seeArchiveModal() {
    return Modal.confirm({
      title: "???? ????????????????, ???? ???????????? ???????????????????? ???????? ???????????????",
      icon: <ExclamationCircleOutlined />,
      okText: "??????, ????????????????????????",
      okType: "danger",
      cancelText: "??????????????????",
      maskClosable: true,
      onOk() {
        membersCount !== 0 || adminsCount !== 0 || followersCount !== 0
          ? setActiveMemberVisibility(true)
          : ArchiveCity();
      },
    });
  }

  function seeUnArchiveModal() {
    return Modal.confirm({
      title: "???? ????????????????, ???? ???????????? ?????????????????????????? ???????? ???????????????",
      icon: <ExclamationCircleOutlined />,
      okText: "??????, ??????????????????????????",
      okType: "danger",
      cancelText: "??????????????????",
      maskClosable: true,
      onOk() {
        UnArchiveCity();
      },
    });
  }

  function seeDeleteModal() {
    return Modal.confirm({
      title: "???? ????????????????, ???? ???????????? ???????????????? ???????? ???????????????",
      icon: <ExclamationCircleOutlined />,
      okText: "??????, ????????????????",
      okType: "danger",
      cancelText: "??????????????????",
      maskClosable: true,
      onOk() {
        deleteCity();
      },
    });
  }

  function seeJoinModal() {
    return Modal.confirm({
      title: "???? ????????????????, ???? ???????????? ???????????????????? ???? ?????????? ??????????????? ?????? ?????????????????? ???? ?????????? ?????????????? ?????? ?????????????????? ???????? ???????????? ??????????????????.",
      icon: <ExclamationCircleOutlined />,
      okText: "??????, ????????????????????",
      okType: "primary",
      cancelText: "??????????????????",
      maskClosable: true,
      onOk() {
        addMember();
        setLoading(true)
      },
    });
  }

  function seeSkipModal(followerID: number) {
    return Modal.confirm({
      title: "???? ????????????????, ???? ???????????? ???????????????? ???????? ???????????????",
      icon: <ExclamationCircleOutlined />,
      okText: '??????, ????????????????',
      okType: 'primary',
      cancelText: '??????????????????',
      maskClosable: true,
      onOk() { removeMember(followerID) }
    });
  }

  const getCity = async () => {
    setLoading(true);
    try {
      const response = await getCityById(+id);
      setActiveUserID(userApi.getActiveUserId());
      const responce1 = await cityNameOfApprovedMember(userApi.getActiveUserId());
      setCity(response.data);
      setActiveUserCity(responce1.data);
      setPhotosLoading(true);
      setCityLogoLoading(true);
      setPhotos(
        [...response.data.administration, ...response.data.members, ...response.data.followers],
        response.data.logo
      );
      setAdmins(response.data.administration);
      setMembers(response.data.members);
      setFollowers(response.data.followers);
      setDocuments(response.data.documents);
      setCanCreate(response.data.canCreate);
      setCanEdit(response.data.canEdit);
      setIsActiveCity(response.data.isActive);
      setCanJoin(response.data.canJoin);
      setMembersCount(response.data.memberCount);
      setAdminsCount(response.data.administrationCount);
      setFollowersCount(response.data.followerCount);
      setDocumentsCount(response.data.documentsCount);
      setActiveUserRoles(userApi.getActiveUserRoles);
    }
    finally {
      setLoading(false);
    }
  };
  const updateAdmins = async () => {
    const response = await getCityById(+id);
    setAdminsCount(response.data.administrationCount);
    setCity(response.data);
    setAdmins(response.data.administration);
    setPhotosLoading(true);
    setPhotos([...response.data.administration], response.data.logo);
  }

  const addCityAdmin = async (newAdmin: CityAdmin) => {
    let previousAdmin: CityAdmin = new CityAdmin();
    admins.map((admin) => {
      if (admin.adminType.adminTypeName == newAdmin.adminType.adminTypeName) {
        previousAdmin = admin;
      }
    });
    await addAdministrator(newAdmin.cityId, newAdmin);
    await updateAdmins();
    if (previousAdmin.adminType.adminTypeName != "") {
      await createNotification(previousAdmin.userId,
        `???? ????????, ???? ???????? ???????????????????? ????????: '${previousAdmin.adminType.adminTypeName}' ?? ??????????????`, true);
    }
    await createNotification(newAdmin.userId,
      `?????? ???????? ?????????????????? ?????????????????????????????? ????????: '${newAdmin.adminType.adminTypeName}' ?? ??????????????`, true);
      notificationLogic("success", "???????????????????? ?????????????? ?????????????? ?? ????????????");
  };

  const editCityAdmin = async (admin: CityAdmin) => {
    await editAdministrator(id, admin);
    await updateAdmins();
    notificationLogic("success", successfulEditAction("????????????????????????????"));
    await createNotification(admin.userId,
      `?????? ???????? ?????????????????????????? ?????????????????????????????? ????????: '${admin.adminType.adminTypeName}' ?? ??????????????`, true);
  };

  const showConfirm = (newAdmin: CityAdmin, existingAdmin: CityAdmin) => {
    Modal.confirm({
      title: "???????????????????? ???????????? ?????????????????????? ???? ???? ?????????????",
      content: (
        <div style={{ margin: 10 }}>
          <b>
            {existingAdmin.user.firstName} {existingAdmin.user.lastName}
          </b>{" "}
          ?????? ?????? ???????? "{existingAdmin.adminType.adminTypeName}", ?????? ?????????????????? ????????????????????????{" "}
          <b>
            {moment.utc(existingAdmin.endDate).local().format("DD.MM.YYYY") === "Invalid date"
              ? "???? ???? ??????????"
              : moment.utc(existingAdmin.endDate).local().format("DD.MM.YYYY")}
          </b>
          .
        </div>
      ),    
      onCancel() { },
      onOk() {
        if (newAdmin.id === 0) {
          addCityAdmin(newAdmin);
          setAdmins((admins as CityAdmin[]).map(x => x.userId === existingAdmin?.userId && x.adminType.adminTypeName === existingAdmin?.adminType?.adminTypeName ?
             newAdmin : x));
        } else {
          editCityAdmin(newAdmin);
        }
      }
    });
  };

  const showDisableModal = async (admin: CityAdmin) => {
    return Modal.warning({
      title: "???? ???? ???????????? ?????????????? ???????? ?????????? ??????????????????????",
      content: (
        <div style={{ margin: 15 }}>
          <b>
            {admin.user.firstName} {admin.user.lastName}
          </b>{" "}
          ?? ?????????????? ??????????????, ?????? ?????????????????? ????????????????????????{" "}
          <b>
            {moment.utc(admin.endDate).local().format("DD.MM.YYYY") === "Invalid date"
              ? "???? ???? ??????????"
              : moment.utc(admin.endDate).local().format("DD.MM.YYYY")}
          </b>
          .
        </div>
      ),
      onOk() {}
    });
  };

  const showDisable = async (admin: CityAdmin) => {
    return Modal.warning({
      title: "???? ???? ???????????? ?????????????? ???????? ?????????? ??????????????????????",
      content: (
        <div style={{ margin: 15 }}>
          <b>
            {admin.user.firstName} {admin.user.lastName}
          </b>{" "}
            ?????? ?????? ???????? ????????, ?????? ?????????????????? ????????????????????????{" "}
          <b>
            {moment.utc(admin.endDate).local().format("DD.MM.YYYY") === "Invalid date"
              ? "???? ???? ??????????"
              : moment.utc(admin.endDate).local().format("DD.MM.YYYY")}
          </b>
          .
        </div>
      ),
      onOk() {}
    });
  };

  const handleOk = async(admin: CityAdmin) => {
    if (admin.id === 0) {
      const head = (admins as CityAdmin[])
        .find(x => x.adminType.adminTypeName === Roles.CityHead)
      const existingAdmin  = (admins as CityAdmin[])
        .find(x => x.adminType.adminTypeName === admin.adminType.adminTypeName) 
      try {     
        if (Roles.CityHeadDeputy === admin.adminType.adminTypeName && head?.userId === admin.userId){
          showDisableModal(head)
        }
        else if(existingAdmin?.userId === admin.userId){
          showDisable(admin)
        }
        else if(existingAdmin !== undefined) {
          showConfirm(admin, existingAdmin);
        }
        else {
          await addCityAdmin(admin);
        }
      } finally {
        setvisible(false);
      }
    }
    else{
      await editCityAdmin(admin);
    }
  }

  const handleClose = async () => {
    setvisible(false);
  };

  const handleConfirm = async () => {
    setActiveMemberVisibility(false);
  };

  const createNotification = async (userId: string, message: string, cityExist: boolean) => {
    if (cityExist) {
      await NotificationBoxApi.createNotifications(
        [userId],
        message + ": ",
        NotificationBoxApi.NotificationTypes.UserNotifications,
        `/cities/${id}`,
        city.name
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
    getCity();
  }, [])

  useEffect(() => {
    if (city.name.length != 0) {
      PsevdonimCreator.setPseudonimLocation(`cities/${city.name}`, `cities/${id}`);
    }
  },[city])

  return loading ? (
    <Spinner />
  ) : city.id !== 0 ? (
    <Layout.Content className="cityProfile">
      <Row gutter={[0, 15]}>
        <Col span={8} offset={1}></Col>
      </Row>
      <Row gutter={[0, 48]}>
        <Col xl={15} sm={24} xs={24}>
          <Card hoverable className="cityCard">
            <div>
              <Crumb
                current={city.name}
                first="/"
                second={url.replace(`/${id}`, "")}
                second_name="??????????????"
              />
              {isActiveCity ? null : (
                <Tag className="status" color={"red"}>
                  ????????????????????????
                </Tag>
              )}
            </div>
            <Title level={3}>?????????????? {city.name}</Title>
            <Row className="cityPhotos" gutter={[0, 12]}>
              <Col md={13} sm={24} xs={24}>
                {cityLogoLoading ? (
                  <Skeleton.Avatar active shape={"square"} size={172} />
                ) : (
                  <img src={cityLogo64} alt="City" className="cityLogo" />
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
                {city.head ? (
                  <div>
                    <Paragraph>
                      <b>???????????? ??????????????:</b> {city.head.user.firstName}{" "}
                      {city.head.user.lastName}
                    </Paragraph>
                    {city.head.endDate ? (
                      <Paragraph>
                        <b>?????? ??????????????????:</b>{" "}
                        {moment.utc(city.head.startDate).local().format("DD.MM.YYYY")}{" - "}
                        {moment.utc(city.head.endDate).local().format("DD.MM.YYYY")}
                      </Paragraph>
                    ) : (
                      <Paragraph>
                        <b>?????????????? ??????????????????:</b>{" "}
                        {moment.utc(city.head.startDate).local().format("DD.MM.YYYY")}
                      </Paragraph>
                    )}
                  </div>
                ) : (
                  <Paragraph>
                    <b>???? ?????????? ???????????? ??????????????</b>
                  </Paragraph>
                )}

                {city.headDeputy ? (
                  <div>
                    <Paragraph>
                      <b>?????????????????? ???????????? ??????????????:</b> {city.headDeputy.user.firstName}{" "}
                      {city.headDeputy.user.lastName}
                    </Paragraph>
                    {city.headDeputy.endDate ? (
                      <Paragraph>
                        <b>?????? ??????????????????:</b>{" "}
                        {moment.utc(city.headDeputy.startDate).local().format("DD.MM.YYYY")}{" - "}
                        {moment.utc(city.headDeputy.endDate).local().format("DD.MM.YYYY")}
                      </Paragraph>
                    ) : (
                      <Paragraph>
                        <b>?????????????? ??????????????????:</b>{" "}
                        {moment.utc(city.headDeputy.startDate).local().format("DD.MM.YYYY")}
                      </Paragraph>
                    )}
                  </div>
                ) : (
                  <Paragraph>
                    <b>???? ?????????? ???????????????????? ???????????? ??????????????</b>
                  </Paragraph>
                )}
              </Col>
              <Col md={{ span: 10, offset: 1 }} sm={24} xs={24}>
                {city.cityURL || city.email || city.phoneNumber ? (
                  <div>
                    {city.cityURL ? (
                      <Paragraph ellipsis>
                        <b>??????????????????:</b>{" "}
                        <u>
                          <a href={city.cityURL} target="_blank">
                            {city.cityURL}
                          </a>
                        </u>
                      </Paragraph>
                    ) : null}
                    {city.phoneNumber ? (
                      <Paragraph>
                        <b>??????????????:</b> {city.phoneNumber}
                      </Paragraph>
                    ) : null}
                    {city.email ? (
                      <Paragraph>
                        <b>??????????:</b> {city.email}
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
              {canEdit ? (
                <Col>
                  <Button
                    type="primary"
                    className="cityInfoButton"
                    onClick={() => history.push(`/annualreport/table/city`)}
                  >
                    ?????????? ??????????
                  </Button>
                </Col>
              ) : null}
              {canEdit ? (
                <Col xs={24} sm={4}>
                  <Row
                    className="cityIcons"
                    justify={canCreate ? "center" : "start"}
                  >
                    {canEdit ? (
                      <Col>
                        <Tooltip title="???????????????????? ??????????????">
                          <EditOutlined
                            className="cityInfoIcon"
                            onClick={() =>
                              history.push(`/cities/edit/${city.id}`)
                            }
                          />
                        </Tooltip>
                      </Col>
                    ) : null}
                    {canCreate ? (
                      isActiveCity ? (
                        <Col offset={1}>
                          <Tooltip title="???????????????????? ??????????????">
                            <ContainerOutlined
                              className="cityInfoIconDelete"
                              onClick={() => seeArchiveModal()}
                            />
                          </Tooltip>
                        </Col>) : (
                        <React.Fragment>
                          <Col offset={1}>
                            <Tooltip title="???????????????? ??????????????">
                              <DeleteOutlined
                                className="cityInfoIconDelete"
                                onClick={() => seeDeleteModal()}
                              />
                            </Tooltip>
                          </Col>
                          <Col offset={1}>
                            <Tooltip title="?????????????????????????? ??????????????">
                              <ContainerOutlined
                                className="cityInfoIcon"
                                color="green"
                                onClick={() => seeUnArchiveModal()}
                              />
                            </Tooltip>
                          </Col>
                        </React.Fragment>)
                    ) : null}
                  </Row>
                </Col>
              ) : null}
            </Row>
          </Card>
        </Col>

        <Col xl={{ span: 7, offset: 1 }} md={11} sm={24} xs={24}>
          <Card hoverable className="cityCard">
            <Title level={4}>?????????? ?????????????? <a onClick={() => history.push(`/cities/members/${city.id}`)}>
              {membersCount !== 0 ?
                <Badge
                  count={membersCount}
                  style={{ backgroundColor: "#3c5438" }}
                /> : null
              }
            </a>
            </Title>
            <Row className={members.length >= 4 ? "cityItems1" : "cityItems"} justify="center" gutter={[0, 16]}>
              {members.length !== 0 ? (
                members.slice(0, membersToShow).map((member) => (
                  <Col
                    className="cityMemberItem"
                    key={member.id}
                    xs={12}
                    sm={8}
                  >
                    <div
                      onClick={() => canEdit || activeUserRoles.includes(Roles.Supporter) || activeUserRoles.includes(Roles.PlastMember)
                        ? history.push(`/userpage/main/${member.userId}`)
                        : undefined
                      }
                    >
                      {photosLoading ? (
                        <Skeleton.Avatar active size={64}></Skeleton.Avatar>
                      ) : (
                        <Avatar size={64} src={member.user.imagePath} />
                      )}
                      <p className="userName">{member.user.firstName}</p>
                      <p className="userName">{member.user.lastName}</p>
                    </div>
                  </Col>
                ))
              ) : (
                <Paragraph>???? ?????????? ???????????? ??????????????</Paragraph>
              )}
            </Row>
            <div className="cityMoreButton">
              <Button
                type="primary"
                className="cityInfoButton"
                onClick={() => history.push(`/cities/members/${city.id}`)}
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
            <Title level={4}>???????????? ?????????????? <a onClick={() => history.push(`/cities/administration/${city.id}`)}>
              {adminsCount !== 0 ?
                <Badge
                  count={adminsCount}
                  style={{ backgroundColor: "#3c5438" }}
                /> : null
              }
            </a>
            </Title>
            <Row className="cityItems" justify="center" gutter={[0, 16]}>
              {admins.length !== 0 ? (
                admins.slice(0, adminsToShow).map((admin) => (
                  <Col className="cityMemberItem" key={admin.id} xs={12} sm={8}>
                    <div
                      onClick={() => canEdit || activeUserRoles.includes(Roles.Supporter) || activeUserRoles.includes(Roles.PlastMember)
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
                <Paragraph>???? ?????????? ?????????????????? ??????????????</Paragraph>
              )}
            </Row>
            <div className="cityMoreButton">
              {isActiveCity ? (canEdit ? (
                <PlusSquareFilled
                  type="primary"
                  className="addReportIcon"
                  onClick={() => setvisible(true)}
                />) : null) : null}
              <Button
                type="primary"
                className="cityInfoButton"
                onClick={() =>
                  history.push(`/cities/administration/${city.id}`)
                }
              >
                ????????????
              </Button>
            </div>
          </Card>
        </Col>

        <Col xl={{ span: 7, offset: 1 }} md={11} sm={24} xs={24}>
          <Card hoverable className="cityCard">
            <Title level={4}>?????????????????????????? ?????????????? <a onClick={() =>
              canEdit || activeUserRoles.includes(Roles.OkrugaHead) || activeUserRoles.includes(Roles.OkrugaHeadDeputy)
                || activeUserRoles.includes(Roles.KurinHead) || activeUserRoles.includes(Roles.CityHead)
                || activeUserRoles.includes(Roles.CityHeadDeputy) || activeUserRoles.includes(Roles.KurinHeadDeputy)
                || (!activeUserRoles.includes(Roles.RegisteredUser) && city.name == activeUserCity)
                ?
                history.push(`/cities/documents/${city.id}`)
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
                documents.slice(0, documentsToShow).map((document) => (
                  <Col
                    className="cityDocumentItem"
                    xs={12}
                    sm={8}
                    key={document.id}
                  >
                    <div>
                      <FileTextOutlined className="documentIcon" />
                      <p className="documentText">
                        {document.cityDocumentType.name}
                      </p>
                    </div>
                  </Col>
                ))
              ) : (
                <Paragraph>???? ?????????? ???????????????????? ??????????????</Paragraph>
              )}
            </Row>
            <div className="cityMoreButton">
              {canEdit || activeUserRoles.includes(Roles.OkrugaHead) || activeUserRoles.includes(Roles.OkrugaHeadDeputy)
                || activeUserRoles.includes(Roles.KurinHead) || activeUserRoles.includes(Roles.CityHead)
                || activeUserRoles.includes(Roles.CityHeadDeputy) || activeUserRoles.includes(Roles.KurinHeadDeputy)
                || (!activeUserRoles.includes(Roles.RegisteredUser)
                  && city.name == activeUserCity)
                ? (
                  <Button
                    type="primary"
                    className="cityInfoButton"
                    onClick={() => history.push(`/cities/documents/${city.id}`)}
                  >
                    ????????????
                  </Button>
                ) : null
              }
              {isActiveCity ? (canEdit ? (
                <PlusSquareFilled
                  className="addReportIcon"
                  onClick={() => setVisibleModal(true)}
                />
              ) : null) : null}
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
            <Title level={4}>?????????????????????? ?????????????? <a onClick={() => history.push(`/cities/followers/${city.id}`)}>
              {followersCount !== 0 ?
                <Badge
                  count={followersCount}
                  style={{ backgroundColor: "#3c5438" }}
                /> : null
              }
            </a>
            </Title>
            <Row className="cityItems" justify="center" gutter={[0, 16]}>
              {isActiveCity ? (canJoin ? (
                <Col
                  className="cityMemberItem"
                  xs={12}
                  sm={8}
                  onClick={() => seeJoinModal()}
                >
                  <div>
                    <Avatar
                      className="addFollower"
                      size={64}
                      icon={<UserAddOutlined />}
                    />
                    <p>????????????????????</p>
                  </div>
                </Col>
              ) : null) : <Paragraph>???? ?????????? ???????????????????????? ??????????????</Paragraph>}
              {followers.length !== 0 ? (
                followers.slice(0, canJoin ? followersToShow : followersToShowOnAdd).map((followers) => (
                  <Col
                    className="cityMemberItem"
                    xs={12}
                    sm={8}
                    key={followers.id}
                  >
                    <div>
                      <div
                        onClick={() => canEdit || activeUserRoles.includes(Roles.Supporter) || activeUserRoles.includes(Roles.PlastMember)
                          ? history.push(`/userpage/main/${followers.userId}`)
                          : undefined
                        }
                      >
                        {photosLoading ? (
                          <Skeleton.Avatar active size={64}></Skeleton.Avatar>
                        ) : (
                          <Avatar size={64} src={followers.user.imagePath} />
                        )}
                        <p className="userName">{followers.user.firstName}</p>
                        <p className="userName">{followers.user.lastName}</p>
                      </div>
                      {(canEdit && isLoadingPlus) || (isLoadingMemberId !== followers.id && !isLoadingPlus) ? (
                        <Tooltip placement={"bottom"} title={"???????????? ???? ????????????"}>
                          <PlusOutlined
                            className="approveIcon"
                            onClick={() => changeApproveStatus(followers.id)}
                          />
                        </Tooltip>
                      ) : (followers.userId === activeUserID) ? (
                        <Tooltip placement={"bottom"} title={"???????????????? ??????????????"}>
                          <MinusOutlined
                            className="approveIcon"
                            onClick={() => seeSkipModal(followers.id)}
                          />
                        </Tooltip>) : !isLoadingPlus && isLoadingMemberId === followers.id ? (
                          <Tooltip placement={"bottom"} title={"??????????????????"}>
                            <LoadingOutlined className="approveIcon" />
                          </Tooltip>
                        ) : null
                      }
                    </div>
                  </Col>
                ))
              ) : canJoin ? null : (
                <Paragraph>???? ?????????? ???????????????????????? ??????????????</Paragraph>
              )}
            </Row>
            <div className="cityMoreButton">
              <Button
                type="primary"
                className="cityInfoButton"
                onClick={() => history.push(`/cities/followers/${city.id}`)}
              >
                ????????????
              </Button>
            </div>
          </Card>
        </Col>
      </Row>
      <CityDetailDrawer
        city={city}
        setVisibleDrawer={setVisibleDrawer}
        visibleDrawer={visibleDrawer}
      ></CityDetailDrawer>
      <Modal
        title="???????????? ????????????????"
        visible={visible}
        onCancel={handleClose}
        footer={null}
      >
        <AddCitiesNewSecretaryForm
          onAdd={handleOk}
          cityId={+id}
          head={city.head}
          headDeputy={city.headDeputy}
          visibleModal={visible}>
        </AddCitiesNewSecretaryForm>
      </Modal>

      <Modal
        title="???? ???????? ???? ???? ???????????? ???????????????????? ?????????????????? ??????????????"
        visible={activeMemberVisibility}
        onOk={handleConfirm}
        onCancel={handleConfirm}
        footer={null}
      >
        <CheckActiveMembersForm members={members} followers={followers} admins={admins} onAdd={handleConfirm} />
      </Modal>

      {canEdit ? (
        <AddDocumentModal
          cityId={+id}
          document={document}
          setDocument={setDocument}
          visibleModal={visibleModal}
          setVisibleModal={setVisibleModal}
          onAdd={onAdd}
        ></AddDocumentModal>
      ) : null}
    </Layout.Content>
  ) : (
    <Title level={2}>?????????? ???? ????????????????</Title>
  );
};

export default City;
