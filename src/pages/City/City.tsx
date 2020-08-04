import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { Avatar, Row, Col, Button, Spin, Layout } from "antd";
<<<<<<< HEAD
import {
  UserOutlined,
  FileTextOutlined,
  EditOutlined,
  PlusSquareFilled,
  UserAddOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import moment from "moment";
import { addFollower, getCityById, getLogo, toggleMemberStatus } from "../../api/citiesApi";
import classes from "./City.module.css";
import CityDefaultLogo from "../../assets/images/default_city_image.jpg";

interface CityProps {
  id: number;
  name: string;
  logo: string;
  description: string;
  cityURL: string;
  phoneNumber: string;
  email: string;
  region: string;
  street: string;
  houseNumber: string;
  officeNumber: string;
  postIndex: string;
  members: MemberProps[];
  followers: MemberProps[];
  administration: AdminProps[];
  documents: DocumentProps[];
  head: AdminProps;
}

interface AdminProps {
  id: number;
  user: {
    id: string;
    firstName: string;
    lastName: string;
  };
  adminType: {
    adminTypeName: string;
  };
  startDate: string;
  endDate: string;
}

interface MemberProps {
  id: number;
  user: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

interface DocumentProps {
  id: number;
  cityDocumentType: {
    name: string;
  };
}

const City = () => {
  const history = useHistory();
  const { id } = useParams();

  const [loading, setLoading] = useState(false);
  const [city, setCity] = useState<CityProps>({
    id: 0,
    name: "",
    logo: "",
    description: "",
    cityURL: "",
    phoneNumber: "",
    email: "",
    region: "",
    street: "",
    houseNumber: "",
    officeNumber: "",
    postIndex: "",
    members: [
      {
        id: 0,
        user: {
          id: "",
          firstName: "",
          lastName: "",
        },
      },
    ],
    followers: [
      {
        id: 0,
        user: {
          id: "",
          firstName: "",
          lastName: "",
        },
      },
    ],
    administration: [
      {
        id: 0,
        user: {
          id: "",
          firstName: "",
          lastName: "",
        },
        adminType: {
          adminTypeName: "",
        },
        startDate: "1000-10-10",
        endDate: "1000-10-10",
      },
    ],
    documents: [
      {
        id: 0,
        cityDocumentType: {
          name: "",
        },
      },
    ],
    head: {
      id: 0,
      user: {
        id: "",
        firstName: "",
        lastName: "",
      },
      adminType: {
        adminTypeName: "",
      },
      startDate: "1000-10-10",
      endDate: "1000-10-10",
    },
  });
  const [canEdit, setCanEdit] = useState(false);
  const [canJoin, setCanJoin] = useState(false);
  const [canApprove, setCanApprove] = useState(false);
  const [canSeeReports, setCanSeeReports] = useState(false);
  const [canAddReports, setCanAddReports] = useState(true);
=======
import { UserOutlined, FileTextOutlined, EditOutlined, PlusSquareFilled, UserAddOutlined, PlusOutlined, CloseOutlined } from "@ant-design/icons";
import moment from "moment";
import { addFollower, getCityById, getLogo, removeCity, toggleMemberStatus } from "../../api/citiesApi";
import classes from "./City.module.css";
import CityDefaultLogo from "../../assets/images/default_city_image.jpg";
import CityProfile from "../../models/City/CityProfile";
import CityMember from '../../models/City/CityMember';
import CityAdmin from '../../models/City/CityAdmin';
import CityDocument from '../../models/City/CityDocument';

const City = () => {
  const history = useHistory();
  const {id} = useParams();

  const [loading, setLoading] = useState(false);
  const [city, setCity] = useState<CityProfile>(new CityProfile());
  const [admins, setAdmins] = useState<CityAdmin[]>([]);
  const [members, setMembers] = useState<CityMember[]>([]);
  const [followers, setFollowers] = useState<CityMember[]>([]);
  const [documents, setDocuments] = useState<CityDocument[]>([]);
  const [canEdit, setCanEdit] = useState(false);
  const [canJoin, setCanJoin] = useState(false);
  const [canApprove, setCanApprove] = useState(false);
  const [canAddReports, setCanAddReports] = useState(false);
>>>>>>> 5f13343c48a83b4427c8b26e0f4ee86ad7bf0544

  const changeApproveStatus = async (memberId: number) => {
    const member = await toggleMemberStatus(memberId);
    
<<<<<<< HEAD
    if (city.members.length < 6) {
      city.members = [...city.members, member.data];
    }

    city.followers = city.followers.filter(f => f.id !== memberId);
=======
    if (members.length < 6) {
      setMembers([...members, member.data]);
    }

    setFollowers(followers.filter(f => f.id !== memberId));
>>>>>>> 5f13343c48a83b4427c8b26e0f4ee86ad7bf0544
  };

  const addMember = async (cityId: number) => {
    const follower = await addFollower(cityId);

<<<<<<< HEAD
    if (city.followers.length < 6) {
      city.followers = [...city.followers, follower.data];
=======
    if (followers.length < 6) {
      setFollowers([...followers, follower.data]);
>>>>>>> 5f13343c48a83b4427c8b26e0f4ee86ad7bf0544
    }

    setCanJoin(!canJoin);
  };

<<<<<<< HEAD
=======
  const deleteCity = async () => {
    history.push('/cities');

    await removeCity(+id);
  }

>>>>>>> 5f13343c48a83b4427c8b26e0f4ee86ad7bf0544
  const getCity = async () => {
    setLoading(true);

    try {
      const response = await getCityById(+id);

      if (response.data.logo === null) {
        response.data.logo = CityDefaultLogo;
      } else {
        const logo = await getLogo(response.data.logo);
        response.data.logo = logo.data;
      }

      setCity(response.data);
<<<<<<< HEAD
      setCanEdit(response.data.canEdit);
      setCanJoin(response.data.canJoin);
      setCanApprove(response.data.canApprove);
      setCanSeeReports(response.data.canSeeReports);
=======
      setAdmins(response.data.administration);
      setMembers(response.data.members);
      setFollowers(response.data.followers);
      setDocuments(response.data.documents);
      setCanEdit(response.data.canEdit);
      setCanJoin(response.data.canJoin);
      setCanApprove(response.data.canApprove);
>>>>>>> 5f13343c48a83b4427c8b26e0f4ee86ad7bf0544
      setCanAddReports(response.data.canAddReports);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCity();
<<<<<<< HEAD
  }, [id, city]);
=======
  }, []);
>>>>>>> 5f13343c48a83b4427c8b26e0f4ee86ad7bf0544

  return loading ? (
    <Layout.Content className={classes.spiner}>
      <Spin size="large" />
    </Layout.Content>
  ) : city.id !== 0 && !loading ? (
    <div>
      <Row
        justify="space-around"
        gutter={[0, 40]}
        style={{ overflow: "hidden" }}
      >
        <Col
          flex="0 1 63%"
          style={{
            minHeight: "180px",
            marginLeft: "1.5%",
            marginRight: "1.5%",
          }}
        >
          <section className={classes.list}>
            {canEdit ? (
              <EditOutlined
<<<<<<< HEAD
                className={classes.listIcon}
                onClick={() => history.push(`/cities/edit/${city.id}`)}
              />
            ) : null}
=======
                className={classes.editIcon}
                onClick={() => history.push(`/cities/edit/${city.id}`)}
              />
            ) : null}
            {canEdit ? (
              <CloseOutlined
                className={classes.removeIcon}
                onClick={() => deleteCity()}
              />
            ) : null}
>>>>>>> 5f13343c48a83b4427c8b26e0f4ee86ad7bf0544
            <h1 className={classes.title}>{`Станиця ${city.name}`}</h1>
            <Row
              gutter={16}
              justify="space-around"
              style={{ marginTop: "20px", marginBottom: "10px" }}
            >
              <Col flex="1" offset={1}>
                <div className={classes.mainInfo}>
                  <img
<<<<<<< HEAD
                    src={city.logo}
=======
                    src={city.logo || undefined}
>>>>>>> 5f13343c48a83b4427c8b26e0f4ee86ad7bf0544
                    alt="City"
                    style={{ width: "100%", height: "auto", maxWidth: "100%" }}
                  />
                  <p>
                    <b>Станичний</b>:{" "}
                    {city.head
                      ? `${city.head.user.firstName} ${city.head.user.lastName}`
                      : "-"}
                  </p>
                  <p>
                    <b>
                      {city.head
                        ? city.head.startDate
                          ? `${moment(city.head.startDate).format(
                              "DD.MM.YYYY"
                            )}`
                          : "-"
                        : null}
                      {city.head
                        ? city.head.endDate
                          ? ` - ${moment(city.head.endDate).format(
                              "DD.MM.YYYY"
                            )}`
                          : null
                        : null}
                    </b>
                  </p>
                </div>
              </Col>
              <Col flex="1" offset={1}>
                <iframe
                  src=""
                  title="map"
                  aria-hidden="false"
                  className={classes.mainMap}
                />
                <div className={classes.contactsInfo}>
                  <b className={classes.contactsName}>Контакти:</b>
                  <div className={classes.contactsContent}>
                    <p>{city.email}</p>
                    <p>{city.cityURL}</p>
                  </div>
                </div>
              </Col>
            </Row>
          </section>
        </Col>
        <Col
          flex="0 1 30%"
          style={{
            minHeight: "180px",
            marginLeft: "1.5%",
            marginRight: "1.5%",
          }}
        >
          <section className={classes.list}>
            <h1 className={classes.title}>Члени станиці</h1>
            <Row
              justify="space-around"
              gutter={[0, 16]}
              style={{
                paddingRight: "5px",
                paddingLeft: "5px",
                overflow: "hidden",
                maxHeight: "70%",
                marginTop: "20px",
              }}
            >
<<<<<<< HEAD
              {city.members.length !== 0 ? (
                city.members.map((member: MemberProps) => (
=======
              {members.length !== 0 ? (
                members.map((member) => (
>>>>>>> 5f13343c48a83b4427c8b26e0f4ee86ad7bf0544
                  <Col className={classes.listItem} key={member.id} span={7}>
                    <div>
                      <Avatar
                        size={64}
                        icon={<UserOutlined />}
                        className={classes.profileImg}
                      />
                      <p className={classes.userName}>
                        {member.user.firstName}
                      </p>
                      <p className={classes.userName}>{member.user.lastName}</p>
                    </div>
                  </Col>
                ))
              ) : (
                <h2>Ще немає членів станиці</h2>
              )}
            </Row>
            <div className={classes.bottomButton}>
              <Button
                type="primary"
                className={classes.listButton}
                onClick={() => history.push(`/cities/members/${city.id}`)}
              >
                Більше
              </Button>
            </div>
          </section>
        </Col>
      </Row>

      <Row
        justify="space-around"
        gutter={[0, 40]}
        style={{ overflow: "hidden", marginTop: "20px" }}
      >
        <Col
          flex="0 1 30%"
          style={{
            minHeight: "180px",
            marginLeft: "1.5%",
            marginRight: "1.5%",
          }}
        >
          <section className={classes.list}>
            <h1 className={classes.title}>Провід станиці</h1>
            <Row
              justify="space-around"
              gutter={[0, 16]}
              style={{
                paddingRight: "5px",
                paddingLeft: "5px",
                paddingTop: "20px",
                paddingBottom: "20px",
                overflow: "hidden",
                maxHeight: "70%",
              }}
            >
<<<<<<< HEAD
              {city.administration.length !== 0 ? (
                city.administration.map((member: MemberProps) => (
=======
              {admins.length !== 0 ? (
                admins.map((member) => (
>>>>>>> 5f13343c48a83b4427c8b26e0f4ee86ad7bf0544
                  <Col className={classes.listItem} key={member.id} span={7}>
                    <div>
                      <Avatar
                        size={64}
                        icon={<UserOutlined />}
                        className={classes.profileImg}
                      />
                      <p className={classes.userName}>
                        {member.user.firstName}
                      </p>
                      <p className={classes.userName}>{member.user.lastName}</p>
                    </div>
                  </Col>
                ))
              ) : (
                <h2>Ще немає діловодів станиці</h2>
              )}
            </Row>
            <div className={classes.bottomButton}>
              <Button
                type="primary"
                className={classes.listButton}
                onClick={() =>
                  history.push(`/cities/administration/${city.id}`)
                }
              >
                Більше
              </Button>
            </div>
          </section>
        </Col>

<<<<<<< HEAD
        {canSeeReports ? (
          <Col
            flex="0 1 30%"
            style={{
              minHeight: "180px",
              marginLeft: "1.5%",
              marginRight: "1.5%",
            }}
          >
            <section className={classes.list}>
              <h1 className={classes.title}>Документообіг станиці</h1>
              <Row
                justify="space-around"
                gutter={[0, 16]}
                style={{
                  paddingRight: "5px",
                  paddingLeft: "5px",
                  paddingTop: "20px",
                  paddingBottom: "20px",
                  overflow: "hidden",
                  maxHeight: "70%",
                }}
              >
                {city.documents.length !== 0 ? (
                  city.documents.map((document: DocumentProps) => (
                    <Col
                      className={classes.listItem}
                      key={document.id}
                      span={7}
                    >
                      <div>
                        <FileTextOutlined
                          style={{ fontSize: "60px" }}
                          className={classes.profileImg}
                        />
                        <p className={classes.documentText}>
                          {document.cityDocumentType.name}
                        </p>
                      </div>
                    </Col>
                  ))
                ) : (
                  <h2>Ще немає документів станиці</h2>
                )}
              </Row>
              <div className={classes.bottomButton}>
                <Button
                  type="primary"
                  className={classes.listButton}
                  onClick={() => history.push(`/cities/documents/${city.id}`)}
                >
                  Деталі
                </Button>
                {canAddReports ? (
                  <div className={classes.flexContainer}>
                    <PlusSquareFilled className={classes.addReportIcon} />
                  </div>
                ) : null}
              </div>
            </section>
          </Col>
        ) : null}
=======
        <Col
          flex="0 1 30%"
          style={{
            minHeight: "180px",
            marginLeft: "1.5%",
            marginRight: "1.5%",
          }}
        >
          <section className={classes.list}>
            <h1 className={classes.title}>Документообіг станиці</h1>
            <Row
              justify="space-around"
              gutter={[0, 16]}
              style={{
                paddingRight: "5px",
                paddingLeft: "5px",
                paddingTop: "20px",
                paddingBottom: "20px",
                overflow: "hidden",
                maxHeight: "70%",
              }}
            >
              {documents.length !== 0 ? (
                documents.map((document) => (
                  <Col className={classes.listItem} key={document.id} span={7}>
                    <div>
                      <FileTextOutlined
                        style={{ fontSize: "60px" }}
                        className={classes.profileImg}
                      />
                      <p className={classes.documentText}>
                        {document.cityDocumentType.name}
                      </p>
                    </div>
                  </Col>
                ))
              ) : (
                <h2>Ще немає документів станиці</h2>
              )}
            </Row>
            <div className={classes.bottomButton}>
              <Button
                type="primary"
                className={classes.listButton}
                onClick={() => history.push(`/cities/documents/${city.id}`)}
              >
                Деталі
              </Button>
              {canAddReports ? (
                <div className={classes.flexContainer}>
                  <PlusSquareFilled className={classes.addReportIcon} />
                </div>
              ) : null}
            </div>
          </section>
        </Col>
>>>>>>> 5f13343c48a83b4427c8b26e0f4ee86ad7bf0544

        <Col
          flex="0 1 30%"
          style={{
            minHeight: "180px",
            marginLeft: "1.5%",
            marginRight: "1.5%",
          }}
        >
          <section className={classes.list}>
            <h1 className={classes.title}>Прихильники станиці</h1>
            <Row
              justify="space-around"
              gutter={[0, 16]}
              style={{
                paddingRight: "5px",
                paddingLeft: "5px",
                paddingTop: "20px",
                paddingBottom: "20px",
                overflow: "hidden",
                maxHeight: "70%",
              }}
            >
              {canJoin ? (
                <Col
                  className={classes.listItem}
                  span={7}
                  onClick={() => addMember(city.id)}
                >
                  <div>
                    <Avatar
                      style={{ color: "#3c5438" }}
                      size={64}
                      icon={<UserAddOutlined />}
                      className={classes.addFollower}
                    />
                    <p>Доєднатися</p>
                  </div>
                </Col>
              ) : null}
<<<<<<< HEAD
              {city.followers.length !== 0 ? (
                city.followers.map((member: MemberProps) => (
=======
              {followers.length !== 0 ? (
                followers.map((member) => (
>>>>>>> 5f13343c48a83b4427c8b26e0f4ee86ad7bf0544
                  <Col className={classes.listItem} key={member.id} span={7}>
                    <div>
                      <Avatar
                        size={64}
                        icon={<UserOutlined />}
                        className={classes.profileImg}
                      />
                      {canApprove ? (
                        <PlusOutlined
                          className={classes.approveIcon}
                          onClick={() => changeApproveStatus(member.id)}
                        />
                      ) : null}
                      <p className={classes.userName}>
                        {member.user.firstName}
                      </p>
                      <p className={classes.userName}>{member.user.lastName}</p>
                    </div>
                  </Col>
                ))
<<<<<<< HEAD
              ) : (
                  <h2>Ще немає прихильників станиці</h2>
              )}
            </Row>
=======
              ) : canJoin ? null : (
                <h2>Ще немає прихильників станиці</h2>
              )}
            </Row>

>>>>>>> 5f13343c48a83b4427c8b26e0f4ee86ad7bf0544
            <div className={classes.bottomButton}>
              <Button
                type="primary"
                className={classes.listButton}
                onClick={() => history.push(`/cities/followers/${city.id}`)}
              >
                Більше
              </Button>
            </div>
          </section>
        </Col>
      </Row>
    </div>
  ) : (
    <h1 className={classes.title}>Місто не знайдено</h1>
  );
};

export default City;
