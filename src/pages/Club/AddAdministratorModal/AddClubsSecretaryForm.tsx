import React, { useState, useEffect } from "react";
import classes from "../../Regions/Form.module.css";
import { Form, DatePicker, AutoComplete, Select, Button } from "antd";
import {
  getAllMembers,
} from "../../../api/clubsApi";
import moment from "moment";
import {emptyInput,} from "../../../components/Notifications/Messages"
import AdminType from "../../../models/Admin/AdminType";
import ClubAdmin from "../../../models/Club/ClubAdmin";
import ClubMember from "../../../models/Club/ClubMember";
import "./AddClubsSecretaryForm.less";

import userApi from "../../../api/UserApi";
import { Roles } from "../../../models/Roles/Roles";


type AddClubsNewSecretaryForm = {
  visibleModal: boolean;
  setVisibleModal: (visibleModal: boolean) => void;
  onAdd: (admin: ClubAdmin) => void;
  onCancel: () => void;
  clubId: number;
  admin?: any;
  head?: ClubAdmin;
  headDeputy?: ClubAdmin;
};
const AddClubsNewSecretaryForm = (props: any) => {
  const { onAdd, onCancel } = props;
  const [form] = Form.useForm();
  const [startDate, setStartDate] = useState<any>();
  const [members, setMembers] = useState<ClubMember[]>([]);
  
  const getMembers = async () => {
    const responseMembers = await getAllMembers(props.clubId);
    setMembers(responseMembers.data.members);
  };
    
  const [activeUserRoles, setActiveUserRoles] = useState<string[]>([]);

  const disabledEndDate = (current: any) => {
    return current && current < startDate;
  };

  const disabledStartDate = (current: any) => {
    return current && current > moment();
  };

  const SetAdmin =  (property: any, value: any) => {
    let admin: ClubAdmin = {
      id: property === undefined ? 0 : property.id,
      adminType: {
        ...new AdminType(),
        adminTypeName: value.AdminType,
      },
      clubId: props.clubId,
      userId: property === undefined
        ? JSON.parse(value.userId).id
        : property.userId,
      user: value.user,
      endDate: value.endDate,
      startDate: value.startDate,
    };
    return admin;
  }

  const handleSubmit = async (values: any) => {
    if (JSON.parse(values.userId).id == props.head?.userId ) {
      const newAdmin = SetAdmin(props.head, values);
      onAdd(newAdmin);
    } else if (JSON.parse(values.userId).id == props.headDeputy?.userId){
      const newAdmin = SetAdmin(props.headDeputy, values);
      onAdd(newAdmin);  
    } else if (JSON.parse(values.userId).id != props.head?.userId && JSON.parse(values.userId).id != props.headDeputy?.userId) {
      const newAdmin = SetAdmin(props.admin, values);
      onAdd(newAdmin);
    }
     
  };

  useEffect(() => {
    if (props.visibleModal) {
      form.resetFields();
    }
    getMembers();
    const userRoles = userApi.getActiveUserRoles();
      setActiveUserRoles(userRoles);
  }, [props]);

  return (
    <Form name="basic" onFinish={handleSubmit} form={form} className="formAddSecretaryModal">
      <Form.Item
        className={classes.formField}
        style={{ display: props.admin === undefined ? "flex" : "none" }}
        label="Користувач"
        name="userId"
        rules={[
          {
            required: props.admin === undefined,
            message: <div className="formItemExplain">{emptyInput()}</div>,
          },
        ]}
      >
        <Select showSearch className={classes.inputField}>
          {members?.map((o) => (
            <Select.Option key={o.userId} value={JSON.stringify(o.user)}>
              {o.user.firstName + " " + o.user.lastName}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        className={classes.formField}
        label="Тип адміністрування"
        initialValue={
          props.admin === undefined ? "" : props.admin.adminType.adminTypeName
        }
        name="AdminType"
        rules={[
          {
            required: true,
            message: <div className="formItemExplain">{emptyInput()}</div>,
          },
        ]}
      >
        <AutoComplete
          className={classes.inputField}
          options={[
            { value: Roles.KurinHead, disabled: (activeUserRoles.includes(Roles.KurinHeadDeputy) 
              && activeUserRoles.includes(Roles.Admin)) },
            { value: Roles.KurinHeadDeputy },
            { value: "Голова СПС" },
            { value: "Фотограф" },
            { value: "Писар" },
            { value: "Скарбник" },
            { value: "Домівкар" },
            { value: "Член СПР" },
          ]}
          placeholder={"Тип адміністрування"}
        />
      </Form.Item>

      <Form.Item
        className={classes.formField}
        label="Дата початку"
        name="startDate"
        initialValue={
          props.admin === undefined ? undefined : moment(props.admin.startDate)
        }
      >
        <DatePicker
          className={classes.inputField}
          disabledDate={disabledStartDate}
          onChange={(e) => setStartDate(e)}
          format="DD.MM.YYYY"
        />
      </Form.Item>

      <Form.Item
        className={classes.formField}
        label="Дата кінця"
        name="endDate"
        initialValue={
          props.admin === undefined
            ? undefined
            : props.admin.endDate === null
              ? undefined
              : moment(props.admin.endDate)
        }
      >
        <DatePicker
          className={classes.inputField}
          disabledDate={disabledEndDate}
          format="DD.MM.YYYY"
        />
      </Form.Item>

      <Form.Item style={{ textAlign: "right" }}>
        <Button type="primary" htmlType="submit">
          Опублікувати
        </Button>
      </Form.Item>
    </Form>
  );
};

export default AddClubsNewSecretaryForm;
