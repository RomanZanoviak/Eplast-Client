import React, { useEffect, useState } from "react";
import { Typography, Card, Modal, Space, Form, Row, Col } from "antd";
import { Link, useHistory, useParams } from "react-router-dom";
import Spinner from "../../Spinner/Spinner";
import userApi from "../../../api/UserApi";
import regionsApi from "../../../api/regionsApi";
import RegionMembersTable from "./RegionMembersTable/RegionMembersTable";
import notificationLogic from "../../../components/Notifications/Notification";
import {
    successfulCancelAction,
    successfulConfirmedAction,
    successfulDeleteAction,
} from "../../../components/Notifications/Messages";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import AnnualReportMenu from "../AnnualReportMenu";
import AuthStore from "../../../stores/AuthStore";
import jwt from "jwt-decode";
import StatusStamp from "../AnnualReportStatus";
import { Roles } from "../../../models/Roles/Roles";

const { Title, Text } = Typography;

const RegionAnnualReportInformation = () => {
    const { annualreportId, year } = useParams();
    const history = useHistory();
    const [regionAnnualReport, setRegionAnnualReport] = useState(Object);
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<number>();
    const [isAdmin, setIsAdmin] = useState<boolean>();
    const [isRegionAdmin, setIsRegionAdmin] = useState<boolean>();
    const [userRegionId, setUserRegionId] = useState<number>();

    useEffect(() => {
        checkAccessToManage();
        fetchRegionReports(annualreportId, year);
    }, []);

    const fetchRegionReports = async (annualreportId: number, year: number) => {
        setIsLoading(true);
        try {
            let response = await regionsApi.getReportById(annualreportId, year);
            setRegionAnnualReport(response.data);
            setStatus(response.data.status);
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
            let roles = userApi.getActiveUserRoles();
            setIsAdmin(roles.includes(Roles.Admin));
            setIsRegionAdmin(roles.includes(Roles.OkrugaHead));
            const user: any = jwt(token);
            var regionId = await userApi
                .getById(user.nameid)
                .then((response) => {
                    return response.data?.user.regionId;
                })
                .catch((error) => {
                    notificationLogic("error", error.message);
                });
            setUserRegionId(regionId);
        } catch (error) {
            showError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (id: number) => {
        history.push(`/annualreport/region/edit/${id}/${year}`);
    };

    const handleConfirm = async (id: number) => {
        let response = await regionsApi.confirm(id);
        setStatus(1);
        notificationLogic(
            "success",
            successfulConfirmedAction("???????????? ????????", response.data.name)
        );
    };

    const handleCancel = async (id: number) => {
        let response = await regionsApi.cancel(id);
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
                let response = await regionsApi.removeAnnualReport(id);
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

    return (
        <>
            {isLoading ? (
                <Spinner />
            ) : (
                <>
                    <AnnualReportMenu
                        record={{
                            ...regionAnnualReport,
                            canManage:
                                isRegionAdmin &&
                                regionAnnualReport.regionId == userRegionId,
                        }}
                        isAdmin={isAdmin!}
                        ViewPDF={false}
                        status={status!}
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
                            {`???????????? ???????? ???????????? ${regionAnnualReport.regionName} ???? ${year} ??????`}
                        </Title>
                        <StatusStamp status={status!} />
                        <Link
                            className="LinkText"
                            style={{ fontSize: "14px" }}
                            to={"/regions/" + regionAnnualReport.regionId}
                            target="blank"
                        >
                            ?????????????? ???? ?????????????? ????????????{" "}
                            {regionAnnualReport.regionName}
                        </Link>
                        <br />
                        <br />
                        <Card>
                            <Row gutter={16} align="bottom">
                                <Col xs={24} sm={12} md={12} lg={12}>
                                    <Card.Grid className="container">
                                        <Title level={4}>??????</Title>
                                        <Space direction="vertical">
                                            <Text>{`?????????????????? ?????????????????? ????????????: ${regionAnnualReport.numberOfSeatsPtashat}`}</Text>
                                            <Text>{`?????????????????? ????????????: ${regionAnnualReport?.numberOfPtashata}`}</Text>
                                        </Space>
                                    </Card.Grid>
                                </Col>

                                <Col xs={24} sm={12} md={12} lg={12}>
                                    <Card.Grid className="container">
                                        <Title level={4}>??????</Title>
                                        <Space direction="vertical">
                                            <Text>{`?????????????????? ?????????????????????? ????????: ${regionAnnualReport.numberOfIndependentRiy}`}</Text>
                                            <Text>{`?????????????????? ????????????????: ${regionAnnualReport.numberOfNovatstva}`}</Text>
                                        </Space>
                                    </Card.Grid>
                                </Col>
                            </Row>

                            <Row gutter={16} align="bottom">
                                <Col xs={24} sm={12} md={12} lg={12}>
                                    <Card.Grid className="container">
                                        <Title level={4}>??????</Title>
                                        <Space direction="vertical">
                                            <Text>{`?????????????????? ?????????????????? ?????????????????? ????????????????????????: ${regionAnnualReport.numberOfSeigneurSupporters}`}</Text>
                                            <Text>{`?????????????????? ?????????????????? ??????????????????: ${regionAnnualReport.numberOfSeigneurMembers}`}</Text>
                                        </Space>
                                    </Card.Grid>
                                </Col>

                                <Col xs={24} sm={12} md={12} lg={12}>
                                    <Card.Grid className="container">
                                        <Title level={4}>??????</Title>
                                        <Space direction="vertical">
                                            <Text>{`?????????????????? ?????????????? ?????????????????? ????????????????????????: ${regionAnnualReport.numberOfSeniorPlastynSupporters}`}</Text>
                                            <Text>{`?????????????????? ?????????????? ??????????????????: ${regionAnnualReport.numberOfSeniorPlastynMembers}`}</Text>
                                        </Space>
                                    </Card.Grid>
                                </Col>
                            </Row>

                            <Row gutter={16} align="bottom">
                                <Col xs={24} sm={12} md={12} lg={12}>
                                    <Card.Grid className="container">
                                        <Title level={4}>??????</Title>
                                        <Space direction="vertical">
                                            <Text>{`?????????????????? ?????????????? ?? ??????????????/?????????????? (????????????/??????????????): ${regionAnnualReport.numberOfClubs}`}</Text>
                                            <Text>{`?????????????????? ?????????????????????? ??????????????: ${regionAnnualReport.numberOfIndependentGroups}`}</Text>
                                            <Text>{`?????????????????? ???????????????????????? ??????????: ${regionAnnualReport.numberOfUnatstvaNoname}`}</Text>
                                            <Text>{`?????????????????? ????????????????????????/????: ${regionAnnualReport.numberOfUnatstvaSupporters}`}</Text>
                                            <Text>{`?????????????????? ??????????????????/????: ${regionAnnualReport.numberOfUnatstvaMembers}`}</Text>
                                            <Text>{`?????????????????? ????????????????????????: ${regionAnnualReport.numberOfUnatstvaProspectors}`}</Text>
                                            <Text>{`?????????????????? ????????????/??????????????: ${regionAnnualReport.numberOfUnatstvaSkobVirlyts}`}</Text>
                                            <br />
                                            <br />
                                        </Space>
                                    </Card.Grid>
                                </Col>

                                <Col xs={24} sm={12} md={12} lg={12}>
                                    <Card.Grid className="container">
                                        <Title level={4}>
                                            ?????????????????????????????? ???? ??????????????????????
                                        </Title>
                                        <Space direction="vertical">
                                            <Text>{`?????????????????? ???????????? ???????????????????? (?? ???????? ???????????? ??????, ??????): ${regionAnnualReport.numberOfTeachers}`}</Text>
                                            <Text>{`?????????????????? ?????????????????????????????? (?? ???????????????? ???????? ?????????? ??????????): ${regionAnnualReport.numberOfAdministrators}`}</Text>
                                            <Text>{`?????????????????? ??????, ?????? ?????????????? ?????????????????????? ???? ??????????????????????????????: ${regionAnnualReport.numberOfTeacherAdministrators}`}</Text>
                                        </Space>
                                    </Card.Grid>
                                    <Card.Grid className="container">
                                        <Title level={4}>????????????????????</Title>
                                        <Space direction="vertical">
                                            <Text>{`?????????????????? ??????????????????????: ${regionAnnualReport.numberOfBeneficiaries}`}</Text>
                                            <Text>{`?????????????????? ???????????? ??????????????????????: ${regionAnnualReport.numberOfPlastpryiatMembers}`}</Text>
                                            <Text>{`?????????????????? ???????????????? ????????????: ${regionAnnualReport.numberOfHonoraryMembers}`}</Text>
                                        </Space>
                                    </Card.Grid>
                                </Col>
                            </Row>

                            <RegionMembersTable
                                regionId={regionAnnualReport.regionId}
                                year={year}
                            />
                            <Card.Grid className="container">
                                <Title level={4}>?????????????????? ????????</Title>
                                <Space direction="vertical">
                                    <Text strong={true}>
                                        {`1. ???????????????? ???????????????????????????? ???????????????????? ?????????????????? ?? ??????????????:`}{" "}
                                    </Text>
                                    <Text>{`${regionAnnualReport.characteristic}`}</Text>
                                    <Text strong={true}>
                                        {`2. ???????? ????????????????????/???????????????????? ?????????????????? ????????????, ?????????????????? ????????????: `}{" "}
                                    </Text>
                                    <Text>{`${regionAnnualReport.stateOfPreparation}`}</Text>
                                    <Text strong={true}>
                                        {`3. ???? ?????????????????????? ?????????????????? ?? ?????????? ????????????? ???? ???????????????? ???? ???????????????????????`}{" "}
                                    </Text>
                                    <Text>{`${regionAnnualReport.statusOfStrategy}`}</Text>
                                    <Text strong={true}>
                                        {`4. ???????? ???????????? ???? ???????????????????? ????????????????????:`}{" "}
                                    </Text>
                                    <Text>{`${regionAnnualReport.involvementOfVolunteers}`}</Text>
                                    <Text strong={true}>
                                        {`5. ?????? ?????????????? ???????????????? ???????????? ?????????? ????????????? ????  ?????? ?????????????? ???? ???????????????? ???? ???????????? ???????????????? ????????????????????? `}{" "}
                                    </Text>
                                    <Text>{`${regionAnnualReport.trainedNeeds}`}</Text>
                                    <Text strong={true}>
                                        {`6. ???? ?????????????????? ?????????????? ???????????????? ???????????????????????? ?????? ???????? ?????????????????? ?????? ??????????? ???????? ??????, ???? ??????? `}{" "}
                                    </Text>
                                    <Text>{`${regionAnnualReport.publicFunding}`}</Text>
                                    <Text strong={true}>
                                        {`7. ???? ???????????????????????? ???? ???? ?????????????? (?????????????? ???? ????????, ?????? ?????????????????? ?? ??????????????)?`}{" "}
                                    </Text>
                                    <Text>{`${regionAnnualReport.churchCooperation}`}</Text>
                                    <Text strong={true}>
                                        {`8. ???? ???????????????????? ?????????????? ??????????????????????????? ???????? ??????, ???? ?????? ?? ?? ?????????? ???????????????`}{" "}
                                    </Text>
                                    <Text>{`${regionAnnualReport.fundraising}`}</Text>
                                    <Text strong={true}>
                                        {`9. ???????????? (??????????????????????) ?? ???????????????????? ????????????????:`}{" "}
                                    </Text>
                                    <Text>{`${regionAnnualReport.socialProjects}`}</Text>
                                    <Text strong={true}>
                                        {`10. ?????????????????? ????????????????, ??????????????, ?????? ?????????? ???????????????????? ?????????? ???? ?????????????????????? ???? ?????????????????? ???? ?????????????????????????? ??????????.`}{" "}
                                    </Text>
                                    <Text>{`${regionAnnualReport.problemSituations}`}</Text>
                                    <Text strong={true}>
                                        {`11. ?????????????? ?????????????? ?????????????? ?????? ???????????????? ???????????? ???? ??????????????????:`}{" "}
                                    </Text>
                                    <Text>{`${regionAnnualReport.importantNeeds}`}</Text>
                                    <Text strong={true}>
                                        {`12. ?????????????????? ?????? ???????? ?????????????? ????????????, ???? ?????? ????????????:`}{" "}
                                    </Text>
                                    <Text>{`${regionAnnualReport.successStories}`}</Text>
                                </Space>
                            </Card.Grid>
                        </Card>
                    </Form>
                </>
            )}
        </>
    );
};

export default RegionAnnualReportInformation;
