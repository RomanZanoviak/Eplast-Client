import React, { useEffect, useState } from "react";
import {
  Form,
  DatePicker,
  Select,
  Input,
  Button,
  Row,
  Col,
} from "antd";
import Precaution from "../Interfaces/Precaution";
import UserPrecaution from "../Interfaces/UserPrecaution";
import precautionApi from "../../../api/precautionApi";
import adminApi from "../../../api/adminApi";
import formclasses from "./Form.module.css";
import NotificationBoxApi from "../../../api/NotificationBoxApi";
import {
  emptyInput,
  maxNumber,
  minNumber
} from "../../../components/Notifications/Messages"
import moment from "moment";
import { descriptionValidation } from "../../../models/GllobalValidations/DescriptionValidation";

type FormAddPrecautionProps = {
  setVisibleModal: (visibleModal: boolean) => void;
  onAdd: () => void;
};

const FormAddPrecaution: React.FC<FormAddPrecautionProps> = (props: any) => {
  const { setVisibleModal, onAdd } = props;
  const [form] = Form.useForm();
  const [userData, setUserData] = useState<any[]>([
    {
      user: {
        id: "",
        firstName: "",
        lastName: "",
        birthday: "",
      },
      regionName: "",
      cityName: "",
      clubName: "",
      userPlastDegreeName: "",
      userRoles: "",
    },
  ]);
  const [distData, setDistData] = useState<Precaution[]>(Array<Precaution>());
  const [loadingUserStatus, setLoadingUserStatus] = useState(false);
  const dateFormat = "DD.MM.YYYY";

  const disabledStartDate = (current: any) => {
    return current && current > moment();
  };
  
  useEffect(() => {
    const fetchData = async () => {
      await precautionApi.getPrecautions().then((response) => {
        setDistData(response.data);
      });
      setLoadingUserStatus(true);
      await adminApi.getUsersForTable().then((response) => {
        setUserData(response.data);
        setLoadingUserStatus(false);
      });
    };
    fetchData();
  }, []);

  const backgroundColor = (user: any) => {
    return user.isInLowerRole ? { backgroundColor : '#D3D3D3' } : { backgroundColor : 'white' };
  }    

  const handleCancel = () => {
    form.resetFields();
    setVisibleModal(false);
  };

  const createNotifications = async (userPrecaution: UserPrecaution) => {
    await NotificationBoxApi.createNotifications(
      [userPrecaution.userId],
      `?????? ???????? ???????????? ???????? ??????????????????????: '${userPrecaution.precaution.name}' ?????? ${userPrecaution.reporter}. `,
      NotificationBoxApi.NotificationTypes.UserNotifications,
      `/Precautions`,
      `??????????????????????`
    );

    await NotificationBoxApi.getCitiesForUserAdmins(userPrecaution.userId)
      .then(res => {
        res.cityRegionAdmins.length !== 0 &&
          res.cityRegionAdmins.forEach(async (cra) => {
            await NotificationBoxApi.createNotifications(
              [cra.cityAdminId, cra.regionAdminId],
              `${res.user.firstName} ${res.user.lastName}, ???????? ?? ???????????? ??????????????: '${cra.cityName}' ?????????????? ???????? ??????????????????????: '${userPrecaution.precaution.name}' ?????? ${userPrecaution.reporter}. `,
              NotificationBoxApi.NotificationTypes.UserNotifications,
              `/Precautions`,
              `??????????????????????`
            );
          })
      });
  }

  const handleSubmit = async (values: any) => {
    const newPrecaution: UserPrecaution = {
      id: 0,
      precautionId: JSON.parse(values.Precaution).id,
      precaution: JSON.parse(values.Precaution),
      user: JSON.parse(values.user),
      userId: JSON.parse(values.user).id,
      status: values.status,
      date: values.date,
      endDate: values.date,
      isActive: true,
      reporter: values.reporter,
      reason: values.reason,
      number: values.number,
    };

    await precautionApi.addUserPrecaution(newPrecaution);
    setVisibleModal(false);
    form.resetFields();
    onAdd();
    await createNotifications(newPrecaution);
  };
  return (
    <Form name="basic" onFinish={handleSubmit} form={form} id='area' style={{position: 'relative'}}>
      <Row justify="start" gutter={[12, 0]}>
        <Col md={24} xs={24}>
          <Form.Item
            className={formclasses.formField}
            label="?????????? ?? ??????????????"
            labelCol={{ span: 24 }}
            name="number"
            rules={[
                {
                  required: true,
                  message: emptyInput(),
                },
                {
                  max: 5,
                  message: maxNumber(99999),
                },
                {
                  validator: async (_ : object, value: number) =>
                      value < 1
                          ? Promise.reject(minNumber(1)) 
                          : await precautionApi
                              .checkNumberExisting(value)
                              .then(response => response.data === false)
                              ? Promise.resolve()
                              : Promise.reject('?????? ?????????? ?????? ????????????????')
                }
              ]}
          >
            <Input
              type="number"
              min={1}
              className={formclasses.inputField}
              max={99999}
            />
          </Form.Item>
        </Col>
      </Row>
      <Row justify="start" gutter={[12, 0]}>
        <Col md={24} xs={24}>
          <Form.Item
            className={formclasses.formField}
            label="??????????????????????"
            labelCol={{ span: 24 }}
            name="Precaution"
            rules={[
              {
                required: true,
                message: emptyInput(),
              },
            ]}
          >
            <Select 
              className={formclasses.selectField} 
              showSearch
              getPopupContainer={(triggerNode) => triggerNode.parentNode}
            >
              {distData?.map((o) => (
                <Select.Option key={o.id} value={JSON.stringify(o)}>
                  {o.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>
      <Row justify="start" gutter={[12, 0]}>
        <Col md={24} xs={24}>
          <Form.Item
            className={formclasses.formField}
            label="????'??"
            name="user"
            labelCol={{ span: 24 }}
            rules={[
              { 
                required: true, 
                message: emptyInput() 
              }
            ]}
          >
            <Select
              className={formclasses.selectField}
              showSearch
              loading={loadingUserStatus}
              getPopupContainer={(triggerNode) => triggerNode.parentNode}
            >
              {userData?.map((o) => (
                <Select.Option 
                    key={o.id} 
                    value={JSON.stringify(o)} 
                    style={backgroundColor(o)}
                    disabled={o.isInLowerRole}
                    >
                  {o.firstName + " " + o.lastName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>
      <Row justify="start" gutter={[12, 0]}>
        <Col md={24} xs={24}>
          <Form.Item
            className={formclasses.formField}
            label="?????????????? ??????"
            labelCol={{ span: 24 }}
            name="reporter"
            rules={descriptionValidation.Reporter}
          >
            <Input
              allowClear
              className={formclasses.inputField}
              maxLength={101}
            />
          </Form.Item>
        </Col>
      </Row>
      <Row justify="start" gutter={[12, 0]}>
        <Col md={24} xs={24}>
          <Form.Item
            className={formclasses.formField}
            name="date"
            label="???????? ????????????????????????"
            labelCol={{ span: 24 }}
            rules={[
              { 
                required: true, 
                message: emptyInput() 
              }
            ]}
          >
            <DatePicker
              format={dateFormat}
              className={formclasses.selectField}
              disabledDate={disabledStartDate}
              getPopupContainer = {() => document.getElementById('area')! as HTMLElement}
              popupStyle={{position: 'absolute'}}
            />
          </Form.Item>
        </Col>
      </Row>
      <Row justify="start" gutter={[12, 0]}>
        <Col md={24} xs={24}>
          <Form.Item
            className={formclasses.formField}
            label="??????????????????????????"
            labelCol={{ span: 24 }}
            name="reason"
            rules={descriptionValidation.Reason}
          >
            <Input.TextArea
              allowClear
              autoSize={{
                minRows: 2,
                maxRows: 6,
              }}
              className={formclasses.inputField}
              maxLength={501}
            />
          </Form.Item>
        </Col>
      </Row>
      <Row justify="start" gutter={[12, 0]}>
        <Col md={24} xs={24}>
          <Form.Item
            className={formclasses.formField}
            label="????????????"
            labelCol={{ span: 24 }}
            name="status"
            rules={[
              {
                required: true,
                message: emptyInput(),
              },
            ]}
          >
            <Select 
              className={formclasses.selectField} 
              showSearch
              getPopupContainer={(triggerNode) => triggerNode.parentNode}
            >
              <Select.Option key="9" value="????????????????">????????????????</Select.Option>
              <Select.Option key="10" value="??????????????????????">??????????????????????</Select.Option>
              <Select.Option key="11" value="??????????????????">??????????????????</Select.Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>
      <Row justify="start" gutter={[12, 0]}>
        <Col md={24} xs={24}>
          <Form.Item>
            <div className={formclasses.cardButton}>
              <Button key="back" onClick={handleCancel} className={formclasses.buttons}>
                ??????????????????
              </Button>
              <Button type="primary" htmlType="submit" className={formclasses.buttons}>
                ????????????????????????
              </Button>
            </div>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
};

export default FormAddPrecaution;
