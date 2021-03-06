import React, { useEffect, useState } from "react";
import { useHistory, useParams, useRouteMatch } from "react-router-dom";
import { Avatar, Row, Col, Button, Layout, Modal, Skeleton, Card, Tooltip, Badge, Tag } from "antd";
import {
  FileTextOutlined,
  EditOutlined,
  PlusSquareFilled,
  UserAddOutlined,
  PlusOutlined,
  DeleteOutlined,
  ContainerOutlined,
  ExclamationCircleOutlined,
  MinusOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import moment from "moment";
import {
   addFollower, 
   getClubById,
   getLogo, 
   removeClub, 
   unArchiveClub, 
   archiveClub, 
   toggleMemberStatus, 
   clubNameOfApprovedMember, 
   removeFollower,
   addAdministrator,
   editAdministrator,
   getUserClubAccess
  } from "../../../api/clubsApi";
import userApi from "../../../api/UserApi";
import "./Club.less";
import ClubDefaultLogo from "../../../assets/images/default_club_image.jpg";
import ClubProfile from "../../../models/Club/ClubProfile";
import ClubMember from '../../../models/Club/ClubMember';
import ClubAdmin from '../../../models/Club/ClubAdmin';
import ClubDocument from '../../../models/Club/ClubDocument';
import AddDocumentModal from "../AddDocumentModal/AddDocumentModal";
import CheckActiveMembersForm from "./CheckActiveMembersForm";
import AuthStore from "../../../stores/AuthStore";
import jwt from 'jwt-decode';
import Title from "antd/lib/typography/Title";
import Paragraph from "antd/lib/typography/Paragraph";
import Spinner from "../../Spinner/Spinner";
import ClubDetailDrawer from "../ClubDetailDrawer/ClubDetailDrawer";
import NotificationBoxApi from "../../../api/NotificationBoxApi";
import notificationLogic from "../../../components/Notifications/Notification";
import { successfulArchiveAction, successfulDeleteAction, successfulEditAction, successfulUnarchiveAction } from "../../../components/Notifications/Messages";
import Crumb from "../../../components/Breadcrumb/Breadcrumb";
import PsevdonimCreator from "../../../components/HistoryNavi/historyPseudo";
import AddClubsNewSecretaryForm from "../AddAdministratorModal/AddClubsSecretaryForm";
import { Roles } from "../../../models/Roles/Roles";
const sloganMaxLength = 38;

const Club = () => {
  const history = useHistory();
  const { id } = useParams();
  const { url } = useRouteMatch();

  const [loading, setLoading] = useState(false);
  const [club, setClub] = useState<ClubProfile>(new ClubProfile());
  const [clubLogo64, setClubLogo64] = useState<string>("");
  const [visibleModal, setVisibleModal] = useState(false);
  const [visibleDrawer, setVisibleDrawer] = useState(false);
  const [visible, setvisible] = useState<boolean>(false);
  const [admins, setAdmins] = useState<ClubAdmin[]>([]);
  const [members, setMembers] = useState<ClubMember[]>([]);
  const [followers, setFollowers] = useState<ClubMember[]>([]);
  const [documents, setDocuments] = useState<ClubDocument[]>([]);
  const [userAccesses, setUserAccesses] = useState<{[key: string]:boolean}>({})
  const [canJoin, setCanJoin] = useState(false);
  const [membersCount, setMembersCount] = useState<number>();
  const [adminsCount, setAdminsCount] = useState<number>();
  const [followersCount, setFollowersCount] = useState<number>();
  const [documentsCount, setDocumentsCount] = useState<number>();
  const [photosLoading, setPhotosLoading] = useState<boolean>(false);
  const [activeUserID, setActiveUserID] = useState<string>();
  const [clubLogoLoading, setClubLogoLoading] = useState<boolean>(false);
  const [document, setDocument] = useState<ClubDocument>(new ClubDocument());
  const [activeUserClub, setActiveUserClub] = useState<string>();
  const [activeMemberVisibility, setActiveMemberVisibility] = useState<boolean>(false);
  const [isLoadingPlus, setIsLoadingPlus] = useState<boolean>(true);
  const [isLoadingMemberId, setIsLoadingMemberId] = useState<number>(0);
  const [isActiveClub, setIsActiveClub] = useState<boolean>(true);

  const changeApproveStatus = async (memberId: number) => {
    setIsLoadingMemberId(memberId)
    setIsLoadingPlus(false)
    const member = await toggleMemberStatus(memberId);

    await createNotification(member.data.userId,
      "??????????????, ?????? ???????????????????? ???? ???????????? ????????????", true);
    member.data.user.imagePath = (
      await userApi.getImage(member.data.user.imagePath)
    ).data;
    const response = await getClubById(+id);
    setFollowersCount(response.data.followerCount);
    setMembersCount(response.data.memberCount);
    if (members.length < 9) {
      setMembers([...members, member.data]);
    }
    setFollowers(followers.filter((f) => f.id !== memberId));
    setIsLoadingPlus(true)
  };

  const removeMember = async (followerID: number) => {
    await removeFollower(followerID);
    await createNotification(activeUserID as string, "???? ????????, ???? ???????? ?????????????????? ?? ???????????????????????? ????????????", true);
    const response = await getClubById(+id);
    setFollowersCount(response.data.followerCount);
    setFollowers(followers.filter((f) => f.id !== followerID));
    setCanJoin(true);
  }
  const addMember = async () => {
    if (activeUserClub?.length != 0) {
      await createNotification(activeUserID as string,
        `???? ????????, ???? ???????? ?????????????????? ?? ???????????? ???????????? "${activeUserClub}" ???? ???????????????????? ?????????????? ?? ?????????? ??????????`, false);
    }
    const follower = await addFollower(+id);
    if (club.head !== null) {
      await createNotification(club.head.userId,
        `?????????? ???????????????????? ${follower.data.user.firstName} ${follower.data.user.lastName} ???????????????????? ???? ???????????? ????????????`, true);
    }
    if (club.headDeputy !== null) {
      await createNotification(club.headDeputy.userId,
        `?????????? ???????????????????? ${follower.data.user.firstName} ${follower.data.user.lastName} ???????????????????? ???? ???????????? ????????????`, true);
    }
    follower.data.user.imagePath = (
      await userApi.getImage(follower.data.user.imagePath)
    ).data;
    const response = await getClubById(+id);
    setFollowersCount(response.data.followerCount);
    if (followers.length < 6) {
      setFollowers([...followers, follower.data]);
    }
    setCanJoin(false);
  };


  const ArchiveClub = async () => {
    await archiveClub(club.id);
    notificationLogic("success", successfulArchiveAction("????????????"));
    history.push('/clubs');
  }

  const deleteClub = async () => {
    await removeClub(club.id);
    notificationLogic("success", successfulDeleteAction("????????????"));

    history.push('/clubs');
  };

  const UnArchiveClub = async () => {
    await unArchiveClub(club.id)
    notificationLogic("success", successfulUnarchiveAction("????????????"));

    history.push('/clubs');
  };

  const setPhotos = async (members: ClubMember[], logo: string) => {
    for (let i = 0; i < members.length; i++) {
      members[i].user.imagePath = (
        await userApi.getImage(members[i].user.imagePath)
      ).data;
    }
    setPhotosLoading(false);

    if (logo === null) {
      setClubLogo64(ClubDefaultLogo);
    } else {
      const response = await getLogo(logo);
      setClubLogo64(response.data);
    }
    setClubLogoLoading(false);
  };

  const onAdd = async (newDocument: ClubDocument) => {
    const response = await getClubById(+id);
    setDocumentsCount(response.data.documentsCount);
    if (documents.length < 6) {
      setDocuments([...documents, newDocument]);
    }
  }

  function seeArchiveModal() {
    return Modal.confirm({
      title: "???? ????????????????, ???? ???????????? ???????????????????????? ?????????? ?????????????",
      icon: <ExclamationCircleOutlined />,
      okText: '??????, ????????????????????????',
      okType: 'danger',
      cancelText: '??????????????????',
      maskClosable: true,
      onOk() {
        membersCount !== 0 || adminsCount !== 0 || followersCount !== 0
          ? setActiveMemberVisibility(true)
          : ArchiveClub();
      },
    });
  }

  function seeUnArchiveModal() {
    return Modal.confirm({
      title: "???? ????????????????, ???? ???????????? ?????????????????????????? ?????????? ?????????????",
      icon: <ExclamationCircleOutlined />,
      okText: "??????, ??????????????????????????",
      okType: "danger",
      cancelText: "??????????????????",
      maskClosable: true,
      onOk() {
        UnArchiveClub();
      },
    });
  }

  function seeDeleteModal() {
    return Modal.confirm({
      title: "???? ????????????????, ???? ???????????? ???????????????? ?????????? ?????????????",
      icon: <ExclamationCircleOutlined />,
      okText: "??????, ????????????????",
      okType: "danger",
      cancelText: "??????????????????",
      maskClosable: true,
      onOk() {
        deleteClub();
      },
    });
  }

  function seeJoinModal() {
    return Modal.confirm({
      title: "???? ????????????????, ???? ???????????? ???????????????????? ???? ???????????? ?????????????",
      icon: <ExclamationCircleOutlined />,
      okText: '??????, ????????????????????',
      okType: 'primary',
      cancelText: '??????????????????',
      maskClosable: true,
      onOk() { addMember() }
    });
  }

  function seeSkipModal(followerID: number) {
    return Modal.confirm({
      title: "???? ????????????????, ???? ???????????? ???????????????? ?????????? ?????????????",
      icon: <ExclamationCircleOutlined />,
      okText: '??????, ????????????????',
      okType: 'primary',
      cancelText: '??????????????????',
      maskClosable: true,
      onOk() { removeMember(followerID) }
    });
  }
  const getClub = async () => {
    setLoading(true);
    try {
      await getUserAccessesFoClubs();
      const response = await getClubById(+id);
      setActiveUserID(userApi.getActiveUserId());
      const clubNameResponse = await clubNameOfApprovedMember(userApi.getActiveUserId());
      setActiveUserClub(clubNameResponse.data);
      setPhotosLoading(true);
      setClubLogoLoading(true);
      setPhotos([
        ...response.data.administration,
        ...response.data.members,
        ...response.data.followers,
      ], response.data.logo);
      setAdmins(response.data.administration);
      setClub(response.data);
      setMembers(response.data.members);
      setFollowers(response.data.followers);
      setDocuments(response.data.documents);
      setCanJoin(response.data.canJoin);
      setIsActiveClub(response.data.isActive);
      setMembersCount(response.data.memberCount);
      setAdminsCount(response.data.administrationCount);
      setFollowersCount(response.data.followerCount)
      setDocumentsCount(response.data.documentsCount);
    } finally {
      setLoading(false);
    }
  };

  const getUserAccessesFoClubs = async () => {
    let user: any = jwt(AuthStore.getToken() as string);
    await getUserClubAccess(+id, user.nameid).then(
      response => {
        setUserAccesses(response.data);
      }
    );
  }

  const updateAdmins = async () => {
    const response = await getClubById(+id);
    setAdminsCount(response.data.administrationCount);
    setClub(response.data);
    setAdmins(response.data.administration);
    setPhotosLoading(true);
    setPhotos([...response.data.administration], response.data.logo);
  }

  const addClubAdmin = async (newAdmin: ClubAdmin) => {
    let previousAdmin: ClubAdmin = new ClubAdmin();
    admins.forEach(admin => {
      if (admin.adminType.adminTypeName == newAdmin.adminType.adminTypeName) {
        previousAdmin = admin;
      }
    });
    await addAdministrator(newAdmin.clubId, newAdmin);
    await updateAdmins();
    if (previousAdmin.adminType.adminTypeName != "") {
      await createNotification(previousAdmin.userId,
        `???? ????????, ???? ???????? ???????????????????? ????????: '${previousAdmin.adminType.adminTypeName}' ?? ????????????`, true);
    }
    await createNotification(newAdmin.userId,
      `?????? ???????? ?????????????????? ?????????????????????????????? ????????: '${newAdmin.adminType.adminTypeName}' ?? ????????????`, true);
    notificationLogic("success", "???????????????????? ?????????????? ?????????????? ?? ????????????");
  };

  const editClubAdmin = async (admin: ClubAdmin) => {
    await editAdministrator(admin.id, admin);
    await updateAdmins();
    notificationLogic("success", successfulEditAction("????????????????????????????"));
    await createNotification(admin.userId,
      `?????? ???????? ?????????????????????????? ?????????????????????????????? ????????: '${admin.adminType.adminTypeName}' ?? ????????????`, true);
  };

  const showConfirm = (newAdmin: ClubAdmin, existingAdmin: ClubAdmin) => {
    Modal.confirm({
      title: "???????????????????? ???????????? ?????????????????????? ???? ???? ?????????????",
      content: (
        <div style={{ margin: 10 }}>
          <b>
            {existingAdmin.user.firstName} {existingAdmin.user.lastName}
          </b>{" "}
          ?????? ?????? ???????? "{existingAdmin.adminType.adminTypeName}", ?????? ?????????????????? ????????????????????????{" "}
          <b>
            {moment(existingAdmin.endDate).format("DD.MM.YYYY") ?? "???? ???? ??????????"}
          </b>
          .
        </div>
      ),    
      onCancel() { },
      onOk() {
        if (newAdmin.id === 0) {
          addClubAdmin(newAdmin);
          setAdmins((admins as ClubAdmin[]).map(x => x.userId === existingAdmin?.userId ? newAdmin : x));
        } else {
          editClubAdmin(newAdmin);
        }
      }
    });
  };
  const showDiseableModal = async (admin: ClubAdmin) => {
    return Modal.warning({
      title: "???? ???? ???????????? ?????????????? ???????? ?????????? ??????????????????????",
      content: (
        <div style={{ margin: 15 }}>
          <b>
            {admin.user.firstName} {admin.user.lastName}
          </b>{" "}
          ?? ?????????????? ????????????, ?????? ?????????????????? ????????????????????????{" "}
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

  const handleOk = async(admin: ClubAdmin) => {
      try {
        const head = (admins as ClubAdmin[])
        .find(x => x.adminType.adminTypeName === Roles.KurinHead)
        const existingAdmin  = (admins as ClubAdmin[])
        .find(x => x.adminType.adminTypeName === admin.adminType.adminTypeName)      
        if (Roles.KurinHeadDeputy === admin.adminType.adminTypeName && head?.userId === admin.userId){
          showDiseableModal(head)
        }
        else if(existingAdmin !== undefined) {
          showConfirm(admin, existingAdmin);
        }
        else {
          await addClubAdmin(admin);
        }
      } finally {
        setvisible(false);
      }
  }

  const handleClose = async () => {
    setvisible(false);
  };

  const handleConfirm = async () => {
    setActiveMemberVisibility(false);
  };

  const createNotification = async (userId: string, message: string, clubExist: boolean) => {
    if (clubExist) {
      await NotificationBoxApi.createNotifications(
        [userId],
        message + ": ",
        NotificationBoxApi.NotificationTypes.UserNotifications,
        `/clubs/${id}`,
        club.name
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
    getClub();
  }, []);

  useEffect(() => {
    if (club.name.length != 0) {
      PsevdonimCreator.setPseudonimLocation(`clubs/${club.name}`, `clubs/${id}`);
    }
  }, [club])

  return loading ? (
    <Spinner />
  ) : club.id !== 0 ? (
    <Layout.Content className="clubProfile">
      <Row gutter={[0, 48]}>
        <Col xl={15} sm={24} xs={24}>
          <Card hoverable className="clubCard">
            <div>
              <Crumb
                current={club.name}
                first="/"
                second={url.replace(`/${id}`, "")}
                second_name="????????????"
              />
              {isActiveClub ? null : (
                <Tag className="status" color={"red"}>
                  ????????????????????????
                </Tag>
              )}
            </div>
            <Title level={3}>{club.name}</Title>
            <Row className="clubPhotos" gutter={[0, 12]}>
              <Col md={13} sm={24} xs={24}>
                {clubLogoLoading ? (
                  <Skeleton.Avatar active shape={"square"} size={172} />
                ) : (
                  <img src={clubLogo64} alt="Club" className="clubLogo" />
                )}
              </Col>
              <Col md={{ span: 10, offset: 1 }} sm={24} xs={24}>

                <div>
                  <Title level={4}>???????? ????????????</Title>
                  {club.description.length != 0 ? (
                    <Paragraph>
                      <b>{club.description}</b>
                    </Paragraph>
                  ) : (
                    <Paragraph>
                      <b>???? ?????????? ?????????? ????????????.</b>
                    </Paragraph>
                  )}
                </div>
              </Col>
            </Row>
            <Row className="clubInfo">
              <Col md={13} sm={24} xs={24}>
                {club.head ? (
                  <div>
                    <Paragraph>
                      <b>???????????? ????????????:</b> {club.head.user.firstName}{" "}
                      {club.head.user.lastName}
                    </Paragraph>
                    <Paragraph>
                      {club.head.endDate === null ?
                        (<div>
                          <b>?????????????? ??????????????????:</b>
                          {` ${moment.utc(club.head.startDate).local().format("DD.MM.YYYY")}`}
                        </div>
                        )
                        :
                        (<div>
                          <b>???????????? ??????????????????:</b>
                          {` ${moment.utc(club.head.startDate).local().format("DD.MM.YYYY")} - ${moment.utc(club.head.endDate).local().format("DD.MM.YYYY")}`}
                        </div>
                        )
                      }
                    </Paragraph>
                  </div>
                ) : (
                  <Paragraph>
                    <b>???? ?????????? ???????????? ????????????</b>
                  </Paragraph>
                )}
                {club.headDeputy ? (
                  <div>
                    <Paragraph>
                      <b>?????????????????? ???????????? ????????????:</b> {club.headDeputy.user.firstName}{" "}
                      {club.headDeputy.user.lastName}
                    </Paragraph>
                    <Paragraph>
                      {club.headDeputy.endDate === null ?
                        (<div>
                          <b>?????????????? ??????????????????:</b>
                          {` ${moment.utc(club.headDeputy.startDate).local().format("DD.MM.YYYY")}`}
                        </div>
                        )
                        :
                        (<div>
                          <b>???????????? ??????????????????:</b>
                          {` ${moment.utc(club.headDeputy.startDate).local().format("DD.MM.YYYY")} - ${moment.utc(club.headDeputy.endDate).local().format("DD.MM.YYYY")}`}
                        </div>
                        )
                      }
                    </Paragraph>
                  </div>
                ) : (
                  <Paragraph>
                    <b>???? ?????????? ???????????????????? ???????????? ????????????</b>
                  </Paragraph>
                )}
              </Col>
              <Col md={{ span: 10, offset: 1 }} sm={24} xs={24}>
                {club.slogan || club.clubURL || club.email || club.phoneNumber ? (
                  <div>
                    {club.slogan ? (
                      (club.slogan?.length > sloganMaxLength) ?
                        <Tooltip title={club.slogan}>
                          <Paragraph>
                            <b>??????????:</b> {club.slogan.slice(0, sloganMaxLength - 1) + "..."}
                          </Paragraph>
                        </Tooltip>
                        : <Paragraph>
                          <b>??????????:</b> {club.slogan}
                        </Paragraph>
                    ) : null}
                    {club.clubURL ? (
                      <Paragraph
                        ellipsis>
                        <b>??????????????????:</b>{" "}
                        <u><a href={club.clubURL} target="_blank">
                          {club.clubURL}
                        </a></u>
                      </Paragraph>
                    ) : null}
                    {club.phoneNumber ? (
                      <Paragraph>
                        <b>??????????????:</b> {club.phoneNumber}
                      </Paragraph>
                    ) : null}
                    {club.email ? (
                      (club.email?.length > sloganMaxLength) ?
                        <Tooltip title={club.email}>
                          <Paragraph>
                            <b>??????????:</b> {club.email.slice(0, sloganMaxLength - 1) + "..."}
                          </Paragraph>
                        </Tooltip>
                        : <Paragraph>
                          <b>??????????:</b> {club.email}
                        </Paragraph>
                    ) : null}
                  </div>
                ) : (
                  <Paragraph>
                    <b>?????????? ????????????????????</b>
                  </Paragraph>
                )}
              </Col>
            </Row>
            <Row className="clubButtons" justify="center" gutter={[12, 0]}>
              <Col>
                <Button
                  type="primary"
                  className="clubInfoButton"
                  onClick={() => setVisibleDrawer(true)}
                >
                  ????????????
                </Button>
              </Col>
              {userAccesses["EditClub"] ? (
                <Col>
                  <Button
                    type="primary"
                    className="clubInfoButton"
                    onClick={() => history.push(`/annualreport/table/hovel`)}
                  >
                    ?????????? ??????????
                  </Button>
                </Col>
              ) : null}
              {userAccesses["EditClub"] ? (
                <Col xs={24} sm={4}>
                  <Row
                    className="clubIcons"
                    justify={userAccesses["CreateClub"] ? "center" : "start"}
                  >
                    {userAccesses["EditClub"] ? (
                      <Col>
                        <Tooltip
                          title="???????????????????? ????????????">
                          <EditOutlined
                            className="clubInfoIcon"
                            onClick={() =>
                              history.push(`/clubs/edit/${club.id}`)
                            }
                          />
                        </Tooltip>
                      </Col>
                    ) : null}
                    {userAccesses["DeleteClub"] ? (
                      isActiveClub ? (
                        <Col offset={1}>
                          <Tooltip title="???????????????????? ????????????">
                            <ContainerOutlined
                              className="clubInfoIconDelete"
                              onClick={() => seeArchiveModal()}
                            />
                          </Tooltip>
                        </Col>) : (
                        <React.Fragment>
                          <Col offset={1}>
                            <Tooltip title="???????????????? ????????????">
                              <DeleteOutlined
                                className="clubInfoIconDelete"
                                onClick={() => seeDeleteModal()}
                              />
                            </Tooltip>
                          </Col>
                          <Col offset={1}>
                            <Tooltip title="?????????????????????????? ????????????">
                              <ContainerOutlined
                                className="clubInfoIcon"
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
          <Card hoverable className="clubCard">
            <Title level={4}>?????????? ???????????? <a onClick={() => history.push(`/clubs/members/${club.id}`)}>
              {membersCount !== 0 ?
                <Badge
                  count={membersCount}
                  style={{ backgroundColor: "#3c5438" }}
                /> : null
              }
            </a>
            </Title>
            <Row className="clubItems" justify="center" gutter={[0, 16]}>
              {members.length !== 0 ? (
                members.map((member) => (
                  <Col
                    className="clubMemberItem"
                    key={member.id}
                    xs={12}
                    sm={8}
                  >
                    <div
                      onClick={() =>
                        history.push(`/userpage/main/${member.userId}`)
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
                <Paragraph>???? ?????????? ???????????? ????????????</Paragraph>
              )}
            </Row>
            <div className="clubMoreButton">
              <Button
                type="primary"
                className="clubInfoButton"
                onClick={() => history.push(`/clubs/members/${club.id}`)}
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
          <Card hoverable className="clubCard">
            <Title level={4}>???????????? ???????????? <a onClick={() => history.push(`/clubs/administration/${club.id}`)}>
              {adminsCount !== 0 ?
                <Badge
                  count={adminsCount}
                  style={{ backgroundColor: "#3c5438" }}
                /> : null
              }
            </a>
            </Title>
            <Row className="clubItems" justify="center" gutter={[0, 16]}>
              {admins.length !== 0 ? (
                admins.map((admin) => (
                  <Col className="clubMemberItem" key={admin.id} xs={12} sm={8}>
                    <div
                      onClick={() =>
                        history.push(`/userpage/main/${admin.userId}`)
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
            <div className="clubMoreButton">
              {isActiveClub ? (userAccesses["EditClub"] ? (
                <PlusSquareFilled
                  type="primary"
                  className="addReportIcon"
                  onClick={() => setvisible(true)}
                />) : null) : null}
              <Button
                type="primary"
                className="clubInfoButton"
                onClick={() =>
                  history.push(`/clubs/administration/${club.id}`)
                }
              >
                ????????????
              </Button>
            </div>
          </Card>
        </Col>

        <Col xl={{ span: 7, offset: 1 }} md={11} sm={24} xs={24}>
          <Card hoverable className="clubCard">
            <Title level={4}>?????????????????????????? ???????????? <a onClick={() =>
              userAccesses["IsAdmin"] || (userAccesses["DownloadDocument"] && club.name === activeUserClub)
                ?
                history.push(`/clubs/documents/${club.id}`)
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
            <Row className="clubItems" justify="center" gutter={[0, 16]}>
              {documents.length !== 0 ? (
                documents.map((document) => (
                  <Col
                    className="clubDocumentItem"
                    xs={12}
                    sm={8}
                    key={document.id}
                  >
                    <div>
                      <FileTextOutlined className="documentIcon" />
                      <p className="documentText">
                        {document.clubDocumentType.name}
                      </p>
                    </div>
                  </Col>
                ))
              ) : (
                <Paragraph>???? ?????????? ???????????????????? ????????????</Paragraph>
              )}
            </Row>
            <div className="clubMoreButton">
              { userAccesses["IsAdmin"] || (userAccesses["DownloadDocument"] && club.name === activeUserClub)
                ? (
                  <Button
                    type="primary"
                    className="clubInfoButton"
                    onClick={() => history.push(`/clubs/documents/${club.id}`)}
                  >
                    ????????????
                  </Button>
                ) : null}
              {isActiveClub ? (
               userAccesses["EditClub"] ? (
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
          <Card hoverable className="clubCard">
            <Title level={4}>?????????????????????? ???????????? <a onClick={() => history.push(`/clubs/followers/${club.id}`)}>
              {followersCount !== 0 ?
                <Badge
                  count={followersCount}
                  style={{ backgroundColor: "#3c5438" }}
                /> : null
              }
            </a>
            </Title>
            <Row className="clubItems" justify="center" gutter={[0, 16]}>
              {isActiveClub ? (canJoin ? (
                <Col
                  className="clubMemberItem"
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
              ) : null) : <Paragraph>???? ?????????? ???????????????????????? ????????????</Paragraph>}
              {followers.length !== 0 ? (
                followers.slice(0, canJoin ? 5 : 6).map((followers) => (
                  <Col
                    className="clubMemberItem"
                    xs={12}
                    sm={8}
                    key={followers.id}
                  >
                    <div>
                      <div
                        onClick={() =>
                          history.push(`/userpage/main/${followers.userId}`)
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
                      {(userAccesses["EditClub"] && isLoadingPlus) || (isLoadingMemberId !== followers.id && !isLoadingPlus) ? (
                        <Tooltip placement={"bottom"} title={"???????????? ???? ????????????"}>
                          <PlusOutlined
                            className="approveIcon"
                            onClick={() => changeApproveStatus(followers.id)}
                          />
                        </Tooltip>
                      ) : (followers.userId === activeUserID) ? (
                        <Tooltip placement={"bottom"} title={"???????????????? ????????????"}>
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
                <Paragraph>???? ?????????? ???????????????????????? ????????????</Paragraph>
              )}
            </Row>
            <div className="clubMoreButton">
              <Button
                type="primary"
                className="clubInfoButton"
                onClick={() => history.push(`/clubs/followers/${club.id}`)}
              >
                ????????????
              </Button>
            </div>
          </Card>
        </Col>
      </Row>
      <Modal
        title="???????????? ????????????????"
        visible={visible}
        onCancel={handleClose}
        footer={null}
      >
        <AddClubsNewSecretaryForm
          onAdd={handleOk}
          head={club.head}
          headDeputy={club.headDeputy}
          clubId={+id}
          visibleModal={visible}>
        </AddClubsNewSecretaryForm>
      </Modal>
      <ClubDetailDrawer
        Club={club}
        setVisibleDrawer={setVisibleDrawer}
        visibleDrawer={visibleDrawer}
      ></ClubDetailDrawer>

      <Modal
        title="???? ???????? ???? ???? ???????????? ???????????????????? ???????????????????? ????????????"
        visible={activeMemberVisibility}
        onOk={handleConfirm}
        onCancel={handleConfirm}
        footer={null}
      >
        <CheckActiveMembersForm members={members} admins={admins} followers={followers} onAdd={handleConfirm} />
      </Modal>

      {userAccesses["EditClub"] ? (
        <AddDocumentModal
          ClubId={+id}
          document={document}
          setDocument={setDocument}
          visibleModal={visibleModal}
          setVisibleModal={setVisibleModal}
          onAdd={onAdd}
        ></AddDocumentModal>
      ) : null}
    </Layout.Content>
  ) : (
        <Title level={2}>???????????? ???? ????????????????</Title>
      );
};

export default Club;
