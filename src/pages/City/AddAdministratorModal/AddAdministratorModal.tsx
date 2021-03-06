import React, { useEffect, useState } from "react";
import "./AddAdministrationModal.less";
import { AutoComplete, Button, Col, DatePicker, Form, Modal, Row } from "antd";
import { ExclamationCircleOutlined} from '@ant-design/icons';
import CityAdmin from "./../../../models/City/CityAdmin";
import AdminType from "./../../../models/Admin/AdminType";
import {
  addAdministrator,
  editAdministrator,
  getAllAdmins,
  getCityAdministration,
} from "../../../api/citiesApi";
import notificationLogic from "./../../../components/Notifications/Notification";
import moment from "moment";
import "moment/locale/uk";
import userApi from "../../../api/UserApi";
import{emptyInput, inputOnlyWhiteSpaces} from "../../../components/Notifications/Messages"
import { Roles } from "../../../models/Roles/Roles";
moment.locale("uk-ua");

const confirm = Modal.confirm;

interface Props {
  visibleModal: boolean;
  setVisibleModal: (visibleModal: boolean) => void;
  admin: CityAdmin;
  setAdmin: (admin: CityAdmin) => void;
  cityId: number;
  cityName: string;
  onAdd?: (admin?: CityAdmin) => void;
  onChange?: (id: string, userRoles: string) => void;
}

const AddAdministratorModal = (props: Props) => {
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState<any>();
  const [endDate, setEndDate] = useState<any>();
  const [form] = Form.useForm();
  const [head, setHead] = useState<CityAdmin>();
  const [headDeputy, setHeadDeputy] = useState<CityAdmin>();
  const [admins, setAdmins] = useState<CityAdmin[]>([]);
  const [activeUserRoles, setActiveUserRoles] = useState<string[]>([]);

  const getCityAdmins = async () => {
    setLoading(true);
    if (props.cityId !== 0) {
      const responseAdmins = await getCityAdministration(props.cityId)
      setAdmins(responseAdmins.data)
      const Head = (responseAdmins.data as CityAdmin[])
        .find(x => x.adminType.adminTypeName === Roles.CityHead) 
      setHead(Head);
      const HeadDeputy = (responseAdmins.data as CityAdmin[])
      .find(x => x.adminType.adminTypeName === Roles.CityHeadDeputy) 
      setHeadDeputy(HeadDeputy);
      setLoading(false);
    }
  };

  const disabledEndDate = (current: any) => {
    return current && current < moment();
  };

  const disabledStartDate = (current: any) => {
    return current && current > moment();
  };

  function showEditConfirmModal(admin: CityAdmin) {
    return Modal.confirm({
      title: "???? ????????????????, ???? ???????????? ?????????????? ???????? ???????????? ???????????????????????",
      icon: <ExclamationCircleOutlined />,
      okText: "??????, ??????????????",
      okType: "primary",
      cancelText: "??????????????????",
      maskClosable: true,
      onOk() {
         addCityAdmin(admin);
      },
    });
  }

  const showDiseableModal = async (admin: CityAdmin) => {
    return Modal.warning({
      title: "???? ???? ???????????? ?????????????? ???????? ?????????? ??????????????????????",
      content: (
        <div style={{ margin: 15 }}>
          <b>
            {head?.user.firstName} {head?.user.lastName}
          </b>{" "}
          ?? ?????????????? ??????????????, ?????? ?????????????????? ????????????????????????{" "}
          <b>
            {moment.utc(head?.endDate).local().format("DD.MM.YYYY") === "Invalid date"
              ? "???? ???? ??????????"
              : moment.utc(head?.endDate).local().format("DD.MM.YYYY")}
          </b>
          .
        </div>
      ),
      onOk() {}
    });
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
            {moment(existingAdmin.endDate).format("DD.MM.YYYY") ?? "???? ???? ??????????"}
          </b>
          .
        </div>
      ),    
      onCancel() { },
      onOk() {
        if (newAdmin.id === 0) {
          addCityAdmin(newAdmin);
        } else {
          editCityAdmin(newAdmin);
        }
      }
    });
  };

  const addCityAdmin = async (admin: CityAdmin) => {
    admin = (await addAdministrator(props.admin.cityId, admin)).data;
    notificationLogic("success", "???????????????????? ?????????????? ?????????????? ?? ????????????");
    props.onChange?.(props.admin.userId, admin.adminType.adminTypeName);
    props.onAdd?.(admin);
  };

  const editCityAdmin = async (admin: CityAdmin) => {
    admin = (await editAdministrator(props.admin.cityId, admin)).data;
    notificationLogic("success", "?????????????????????????? ?????????????? ????????????????????????????");
    props.onChange?.(props.admin.userId, admin.adminType.adminTypeName);
    props.onAdd?.(admin);
  };

  const checkAdminId = async (admin: CityAdmin)=> {
    if (admin.id === 0) {
      await addCityAdmin(admin);
    } else {
      await editCityAdmin(admin);
    }
  }

  const handleSubmit = async (values: any) => {
    setLoading(true);

    let admin: CityAdmin = {
      id: props.admin.id,
      adminType: {
        ...new AdminType(),
        adminTypeName: values.adminType,
      },
      cityId: props.cityId,
      user: props.admin.user,
      userId: props.admin.userId,
      endDate: values.endDate?._d,
      startDate: values.startDate?._d,
    };
    try {
      const existingAdmin  = (admins as CityAdmin[])
        .find(x => x.adminType.adminTypeName === admin.adminType.adminTypeName)
      if (Roles.CityHeadDeputy === admin.adminType.adminTypeName && head?.userId === admin.userId) {       
        showDiseableModal(admin);
      }
      else if(existingAdmin !== undefined) {
        showConfirm(admin, existingAdmin);
      }
      else if (admin.userId === head?.userId || admin.userId === headDeputy?.userId) {
        showEditConfirmModal(admin);
      }    
      else {
        await checkAdminId(admin);
      }
    }
    finally {
      props.setVisibleModal(false);
      setLoading(false);
    }
  };

  const handleCancel = () => {
    props.setVisibleModal(false);
  };

  useEffect(() => {
    if (props.visibleModal) {
      form.resetFields();
    }
    getCityAdmins();
    const userRoles = userApi.getActiveUserRoles();
    setActiveUserRoles(userRoles);
  }, [props]);

  return (
    <Modal
      title={
        props.admin.id === 0
          ? `???????????? ?? ???????????? ?????????????? ${props.cityName}`
          : "?????????????????????? ??????????????"
      }
      visible={props.visibleModal}
      footer={null}
      confirmLoading={loading}
      className="addAdministrationModal"
      onCancel={handleCancel}
    >
      <Form name="basic" onFinish={handleSubmit} form={form}>
        <Form.Item
          className="adminTypeFormItem"
          name="adminType"
          label="???????????????? ?????? ??????????????????????????????"
          labelCol={{ span: 24 }}
          initialValue={props.admin.adminType.adminTypeName}
          rules={[
            { 
              required: true, 
              message: emptyInput() 
            },
            {
              pattern: /^\s*\S.*$/,
              message: inputOnlyWhiteSpaces()
            },
          ]}
        >
          <AutoComplete
            className="adminTypeSelect"
            options={[
              { value: Roles.CityHead, disabled: (activeUserRoles.includes(Roles.CityHeadDeputy) 
              && !activeUserRoles.includes(Roles.Admin)) },
              { value: Roles.CityHeadDeputy},
              { value: "???????????? ??????" },
              { value: "??????????" },
              { value: "????????????????" },
              { value: "????????????????" },
              { value: "???????? ??????" },
            ]}
            placeholder={"?????? ??????????????????????????????"}
            value={props.admin.adminType.adminTypeName}
          />
        </Form.Item>
        <Row>
          <Col span={11}>
            <Form.Item
              name="startDate"
              label="?????? ??????????????"
              labelCol={{ span: 24 }}
              initialValue={
                props.admin.startDate
                  ? moment.utc(props.admin.startDate).local()
                  : undefined
              }
            >
              <DatePicker
                className="formSelect"
                disabledDate={disabledStartDate}
                format="DD.MM.YYYY"
                value={
                  props.admin.startDate
                    ? moment.utc(props.admin.startDate).local()
                    : undefined
                }
                onChange={(e) => setStartDate(e)}
              />
            </Form.Item>
          </Col>
          <Col span={11} offset={2}>
            <Form.Item
              name="endDate"
              label="?????? ??????????"
              labelCol={{ span: 24 }}
              initialValue={
                props.admin.endDate ? moment.utc(props.admin.endDate).local() : undefined
              }
            >
              <DatePicker
                className="formSelect"
                disabledDate={disabledEndDate}
                format="DD.MM.YYYY"
                value={
                  props.admin.endDate ? moment.utc(props.admin.endDate).local() : undefined
                }
                onChange={(e) => setEndDate(e)}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item className="cancelConfirmButtons">
          <Row justify="end">
            <Col xs={11} sm={5}>
              <Button key="back" onClick={handleCancel}>
                ??????????????????
              </Button>
            </Col>
            <Col
              className="publishButton"
              xs={{ span: 11, offset: 2 }}
              sm={{ span: 6, offset: 1 }}
            >
              <Button type="primary" htmlType="submit">
                ????????????????????????
              </Button>
            </Col>
          </Row>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddAdministratorModal;
