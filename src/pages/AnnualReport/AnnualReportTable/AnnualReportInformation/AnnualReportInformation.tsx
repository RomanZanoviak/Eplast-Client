import React, { useState, useEffect } from "react";
import { Typography, Card, Modal, Space, Form, Row, Col } from "antd";
import moment from "moment";
import "./AnnualReportInformation.less";
import userApi from "../../../../api/UserApi";
import notificationLogic from "../../../../components/Notifications/Notification";
import AnnualReportApi from "../../../../api/AnnualReportApi";
import Spinner from "../../../Spinner/Spinner";
import { Link, useHistory, useParams } from "react-router-dom";
import AnnualReportMenu from "../../AnnualReportMenu";
import StatusStamp from "../../AnnualReportStatus";
import AuthStore from "../../../../stores/AuthStore";
import jwt from "jwt-decode";
import {
    successfulCancelAction,
    successfulConfirmedAction,
    successfulDeleteAction,
    tryAgain,
} from "../../../../components/Notifications/Messages";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import UserApi from "../../../../api/UserApi";
import { Roles } from "../../../../models/Roles/Roles";

const { Title, Text } = Typography;

const AnnualReportInformation = () => {
    const { id } = useParams();
    const history = useHistory();
    const [cityLegalStatuses, setCityLegalStatuses] = useState<string[]>(
        Array()
    );
    const [cityAnnualReport, setCityAnnualReport] = useState(Object);
    const [isAdmin, setIsAdmin] = useState<boolean>();
    const [isCityAdmin, setIsCityAdmin] = useState<boolean>();
    const [userCityId, setUserCityId] = useState<number>();
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<number>();

    useEffect(() => {
        checkAccessToManage();
        fetchCityReport(id);
        fetchCityLegalStatuses();
    }, []);

    const fetchCityLegalStatuses = async () => {
        setIsLoading(true);
        try {
            let response = await AnnualReportApi.getCityLegalStatuses();
            setCityLegalStatuses(response.data.legalStatuses);
        } catch (error) {
            showError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const checkAccessToManage = async () => {
        setIsLoading(true);
        try {
            let token = AuthStore.getToken() as string;
            let roles = UserApi.getActiveUserRoles();
            setIsAdmin(roles.includes(Roles.Admin));
            setIsCityAdmin(roles.includes(Roles.CityHead));
            const user: any = jwt(token);
            var cityId = await userApi
                .getById(user.nameid)
                .then((response) => {
                    return response.data?.user.cityId;
                })
                .catch((error) => {
                    notificationLogic("error", error.message);
                });
            setUserCityId(cityId);
        } catch (error) {
            showError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchCityReport = async (id: number) => {
        setIsLoading(true);
        try {
            let response = await AnnualReportApi.getById(id);
            setCityAnnualReport(response.data.annualReport);
            setStatus(response.data.annualReport.status);
        } catch (error) {
            showError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (id: number) => {
        history.push(`/annualreport/edit/${id}`);
    };

    const handleConfirm = async (id: number) => {
        let response = await AnnualReportApi.confirm(id);
        setStatus(1);
        notificationLogic(
            "success",
            successfulConfirmedAction("???????????? ????????", response.data.name)
        );
    };

    const handleCancel = async (id: number) => {
        let response = await AnnualReportApi.cancel(id);
        setStatus(0);
        notificationLogic(
            "success",
            successfulCancelAction("???????????? ????????", response.data.name)
        );
    };

    const handleRemove = async (id: number) => {
        Modal.confirm({
            title: "???? ???????????? ???????????? ???????????????? ???????????? ?????????",
            icon: <ExclamationCircleOutlined />,
            okText: "??????, ????????????????",
            okType: "danger",
            cancelText: "??????????????????",
            maskClosable: true,
            async onOk() {
                let response = await AnnualReportApi.remove(id);
                notificationLogic(
                    "success",
                    successfulDeleteAction("???????????? ????????", response.data.name)
                );
                history.goBack();
            },
        });
    };

    const showError = (message: string) => {
        Modal.error({
            title: "??????????????!",
            content: message,
            onOk: () => {
                history.goBack();
            },
        });
    };

    const handleViewPDF = async (id: number) => {
        try {
            const pdf = await AnnualReportApi.getPdf(id);
            window.open(pdf);
        } catch (error) {
            notificationLogic("error", tryAgain);
        }
    };

    return (
        <>
            {isLoading ? (
                <Spinner />
            ) : (
                <>
                    <AnnualReportMenu
                        record={{
                            ...cityAnnualReport,
                            canManage:
                                isCityAdmin &&
                                cityAnnualReport.cityId == userCityId,
                        }}
                        isAdmin={isAdmin!}
                        ViewPDF={true}
                        status={status!}
                        handleViewPDF={handleViewPDF}
                        setStatus={setStatus}
                        handleEdit={handleEdit}
                        handleConfirm={handleConfirm}
                        handleCancel={handleCancel}
                        handleRemove={handleRemove}
                    />
                    <Form
                        onFinish={() => history.goBack()}
                        className="annualreport-form"
                    >
                        <Title className="textCenter" level={3}>
                            {`???????????? ???????? ?????????????? ${cityAnnualReport.city?.name} ???? ${moment.utc(cityAnnualReport.date).local().year()} ??????`}
                        </Title>
                        <StatusStamp status={status!} />
                        <Link
                            className="LinkText"
                            style={{ fontSize: "14px" }}
                            to={"/cities/" + cityAnnualReport.city?.id}
                            target="blank"
                        >
                            ?????????????? ???? ?????????????? ??????????????{" "}{cityAnnualReport.city?.name}
                        </Link>
                        <br />
                        <br />
                        <Card>
                            <Row gutter={16} align="bottom">
                                <Col xs={24} sm={12} md={12} lg={12}>
                                    <Card.Grid className="container">
                                        <Title level={4}>
                                            ???????????? ?????????????????????? ????????????????
                                        </Title>
                                        {cityAnnualReport.newCityAdmin ==
                                            null ? (
                                            <Text>??????????????????</Text>
                                        ) : (
                                            <Link
                                                className="LinkText"
                                                style={{ fontSize: "18px" }}
                                                to={"/userpage/main/" + cityAnnualReport.newCityAdmin.id}
                                                target="blank"
                                            >
                                                {cityAnnualReport.newCityAdmin.firstName
                                                }{" "}{
                                                    cityAnnualReport
                                                        .newCityAdmin.lastName
                                                }
                                            </Link>
                                        )}
                                    </Card.Grid>
                                </Col>

                                <Col xs={24} sm={12} md={12} lg={12}>
                                    <Card.Grid
                                        className="container"
                                        style={{ marginTop: "-5px" }}
                                    >
                                        <Title level={4}>
                                            ???????????????? ???????????? ????????????????
                                        </Title>
                                        <Text>{cityLegalStatuses[cityAnnualReport.newCityLegalStatusType]}</Text>
                                        <br />
                                    </Card.Grid>
                                </Col>
                            </Row>

                            <Row gutter={16} align="bottom">
                                <Col xs={24} sm={12} md={12} lg={12}>
                                    <Card.Grid className="container">
                                        <Title level={4}>??????</Title>
                                        <Space direction="vertical">
                                            <Text>{`?????????????????? ?????????????????? ????????????: ${cityAnnualReport.numberOfSeatsPtashat}`}</Text>
                                            <Text>{`?????????????????? ????????????: ${cityAnnualReport.membersStatistic?.numberOfPtashata}`}</Text>
                                        </Space>
                                    </Card.Grid>
                                </Col>

                                <Col xs={24} sm={12} md={12} lg={12}>
                                    <Card.Grid className="container">
                                        <Title level={4}>??????</Title>
                                        <Space direction="vertical">
                                            <Text>{`?????????????????? ?????????????????????? ????????: ${cityAnnualReport.numberOfIndependentRiy}`}</Text>
                                            <Text>{`?????????????????? ????????????????: ${cityAnnualReport.membersStatistic?.numberOfNovatstva}`}</Text>
                                        </Space>
                                    </Card.Grid>
                                </Col>
                            </Row>

                            <Row gutter={16} align="bottom">
                                <Col xs={24} sm={12} md={12} lg={12}>
                                    <Card.Grid className="container">
                                        <Title level={4}>??????</Title>
                                        <Space direction="vertical">
                                            <Text>{`?????????????????? ?????????????? ?????????????????? ????????????????????????: ${cityAnnualReport.membersStatistic?.numberOfSeniorPlastynSupporters}`}</Text>
                                            <Text>{`?????????????????? ?????????????? ??????????????????: ${cityAnnualReport.membersStatistic?.numberOfSeniorPlastynMembers}`}</Text>
                                        </Space>
                                    </Card.Grid>
                                </Col>

                                <Col xs={24} sm={12} md={12} lg={12}>
                                    <Card.Grid className="container">
                                        <Title level={4}>??????</Title>
                                        <Space direction="vertical">
                                            <Text>{`?????????????????? ?????????????????? ?????????????????? ????????????????????????: ${cityAnnualReport.membersStatistic?.numberOfSeigneurSupporters}`}</Text>
                                            <Text>{`?????????????????? ?????????????????? ??????????????????: ${cityAnnualReport.membersStatistic?.numberOfSeigneurMembers}`}</Text>
                                        </Space>
                                    </Card.Grid>
                                </Col>
                            </Row>

                            <Row gutter={16} align="bottom">
                                <Col xs={24} sm={12} md={12} lg={12}>
                                    <Card.Grid className="container">
                                        <Title level={4}>
                                            ?????????????????????????????? ???? ??????????????????????
                                        </Title>
                                        <Space direction="vertical">
                                            <Text>{`?????????????????? ???????????? ???????????????????? (?? ???????? ???????????? ??????, ??????): ${cityAnnualReport.numberOfTeachers}`}</Text>
                                            <Text>{`?????????????????? ?????????????????????????????? (?? ???????????????? ???????? ?????????? ??????????): ${cityAnnualReport.numberOfAdministrators}`}</Text>
                                            <Text>{`?????????????????? ??????, ?????? ?????????????? ?????????????????????? ???? ??????????????????????????????: ${cityAnnualReport.numberOfTeacherAdministrators}`}</Text>
                                        </Space>
                                    </Card.Grid>
                                </Col>

                                <Col xs={24} sm={12} md={12} lg={12}>
                                    <Card.Grid className="container">
                                        <Title level={4}>????????????????????</Title>
                                        <Space direction="vertical">
                                            <Text>{`?????????????????? ??????????????????????: ${cityAnnualReport.numberOfBeneficiaries}`}</Text>
                                            <Text>{`?????????????????? ???????????? ??????????????????????: ${cityAnnualReport.numberOfPlastpryiatMembers}`}</Text>
                                            <Text>{`?????????????????? ???????????????? ????????????: ${cityAnnualReport.numberOfHonoraryMembers}`}</Text>
                                        </Space>
                                    </Card.Grid>
                                </Col>
                            </Row>

                            <Row gutter={16} align="bottom">
                                <Col xs={24} sm={12} md={12} lg={12}>
                                    <Card.Grid className="container">
                                        <Title level={4}>??????</Title>
                                        <Space direction="vertical">
                                            <Text>{`?????????????????? ?????????????? ?? ??????????????/?????????????? (????????????/??????????????): ${cityAnnualReport.numberOfClubs}`}</Text>
                                            <Text>{`?????????????????? ?????????????????????? ??????????????: ${cityAnnualReport.numberOfIndependentGroups}`}</Text>
                                            <Text>{`?????????????????? ???????????????????????? ??????????: ${cityAnnualReport.membersStatistic?.numberOfUnatstvaNoname}`}</Text>
                                            <Text>{`?????????????????? ????????????????????????/????: ${cityAnnualReport.membersStatistic?.numberOfUnatstvaSupporters}`}</Text>
                                            <Text>{`?????????????????? ??????????????????/????: ${cityAnnualReport.membersStatistic?.numberOfUnatstvaMembers}`}</Text>
                                            <Text>{`?????????????????? ????????????????????????: ${cityAnnualReport.membersStatistic?.numberOfUnatstvaProspectors}`}</Text>
                                            <Text>{`?????????????????? ????????????/??????????????: ${cityAnnualReport.membersStatistic?.numberOfUnatstvaSkobVirlyts}`}</Text>
                                        </Space>
                                    </Card.Grid>
                                </Col>

                                <Col xs={24} sm={12} md={12} lg={12}>
                                    <Card.Grid className="container">
                                        <Title level={4}>???????????????? ??????????</Title>
                                        <Space direction="vertical">
                                            <Text>{`???????????????? ??????????: ${cityAnnualReport.publicFunds}`}</Text>
                                            <Text>{`????????????: ${cityAnnualReport.contributionFunds}`}</Text>
                                            <Text>{`?????????????????? ??????????????????: ${cityAnnualReport.plastSalary}`}</Text>
                                            <Text>{`?????????????????????? ??????????: ${cityAnnualReport.sponsorshipFunds}`}</Text>
                                            <br />
                                            <br />
                                            <br />
                                        </Space>
                                    </Card.Grid>
                                </Col>
                            </Row>

                            <Card.Grid className="container">
                                <Title level={4}>
                                    ??????????????, ???? ?????? ???????????????? ?????????????????????? ???????????????? ???????????????????? ???? ???????????????????? ?????????????? ?????????????? (????????????, ????????????)
                                </Title>
                                <Space direction="vertical">
                                    <Text>
                                        {cityAnnualReport.listProperty === null
                                            ? "???????????????????? ????????????????"
                                            : cityAnnualReport.listProperty}
                                    </Text>
                                </Space>
                            </Card.Grid>
                            <Card.Grid className="container">
                                <Title level={4}>
                                    ?????????????? ?????????????? ??????????, ???? ?? ?? ??????????????
                                </Title>
                                <Space direction="vertical">
                                    <Text>
                                        {cityAnnualReport.improvementNeeds === null
                                            ? "???????????????????? ????????????????"
                                            : cityAnnualReport.improvementNeeds}
                                    </Text>
                                </Space>
                            </Card.Grid>
                        </Card>
                    </Form>
                </>
            )}
        </>
    );
};

export default AnnualReportInformation;
