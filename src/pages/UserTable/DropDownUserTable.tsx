import React, { useState, useEffect } from "react";
import { Menu } from "antd";
import {
  FileSearchOutlined,
  DeleteOutlined,
  EditOutlined,
  ScissorOutlined,
  PlusCircleOutlined,
  MailOutlined,
} from "@ant-design/icons";
import classes from "./UserTable.module.css";
import userDeleteCofirm from "./UserDeleteConfirm";
import ChangeUserRoleModal from "./ChangeUserRoleModal";
import ChangeUserCityModal from "./ChangeUserCityModal";
import adminApi from "../../api/adminApi";
import ModalAddPlastDegree from "../userPage/ActiveMembership/PlastDegree/ModalAddPlastDegree";
import ChangeUserRegionModal from "./ChangeUserRegionModal";
import ChangeUserClubModal from "./ChangeUserClubModal";
import AuthorizeApi from "../../api/authorizeApi";
import UserApi from "../../api/UserApi";
import { Roles } from "../../models/Roles/Roles";
import { AdminRole } from "../../models/Roles/AdminRole";
import { NonAdminRole } from "../../models/Roles/NonAdminRole";
import { IDropdownItem, DropdownItemCreator } from "./DropdownItem";
import { DropdownFunc } from "../../models/UserTable/DropdownFunc";

let authService = new AuthorizeApi();

interface Props {
  record: string;
  pageX: number;
  pageY: number;
  showDropdown: boolean;
  inActiveTab: boolean;
  onDelete: (id: string) => void;
  onChange: (id: string, userRoles: string) => void;
  selectedUser: any;
  selectedUserRoles: Array<string>;
  currentUser: any;
  canView: boolean;
}

const { SubMenu } = Menu;

const DropDown = (props: Props) => {
  const {
    record,
    pageX,
    pageY,
    showDropdown,
    inActiveTab,
    onDelete,
    onChange,
    selectedUser,
    selectedUserRoles,
    currentUser,
    canView
  } = props;

  const [showEditModal, setShowEditModal] = useState(false);
  const [visibleModalDegree, setVisibleModalDegree] = useState<boolean>(false);
  const [showCityModal, setShowCityModal] = useState<boolean>(false);
  const [showRegionModal, setShowRegionModal] = useState<boolean>(false);
  const [showClubModal, setShowClubModal] = useState<boolean>(false);

  const [superAdmin, setSuperAdmin] = useState<boolean>(false);
  const [governingBodyHead, setGoverningBodyHead] = useState<boolean>(true);
  const [currentUserAdminRoles, setCurrentUserAdminRoles] = useState<Array<AdminRole>>([]);
  const [canViewProfile, setCanViewProfile] = useState<boolean>(false);
  const [canDelete, setCanDelete] = useState<boolean>(false);
  const [canChangeCityAdministration, setCanChangeCityAdministration] = useState<boolean>(false);
  const [canChangeClubAdministration, setCanChangeClubAdministration] = useState<boolean>(false);
  const [canChangeRegionAdministration, setCanChangeRegionAdministration] = useState<boolean>(false);
  const [canChangeGoverningBodyAdministration, setCanChangeGoverningBodyAdministration] = useState<boolean>(false);
  const [canChangeUserAccess, setCanChangeUserAccess] = useState<boolean>(false);
  const [canAddDegree, setCanAddDegree] = useState<boolean>(false);

  const [chainOfAccessibility, setChainOfAccessibility] = useState<IDropdownItem>();
  
  //Some megamind function, taken from StackOverflow to convert enum string value to appropriate key
  //I have no idea what's going on here
  function getEnumKeyByEnumValue<T extends {[index:string]:string}>(myEnum:T, enumValue:string):keyof T|null {
    let keys = Object.keys(myEnum).filter(x => myEnum[x] == enumValue);
    return keys.length > 0 ? keys[0] : null;
  }

  //Takes only those roles, which can access User Table and 
  //writes them in array in descending order (as in AdminRole enum)
  const setUserAdminRoles = (allUserRoles: Array<string>): Array<AdminRole> => {

    //All possible AdminRole keys are converted to string array
    const allAdminRolesAsEnumKeys: Array<string> = new Array<string>();
    for(var key in AdminRole) {
      allAdminRolesAsEnumKeys.push(AdminRole[key]);
    }

    //Current user roles as strings (values) are converted to corresponding
    //Roles enum keys, which are also saved as array of string
    const userRolesAsEnumKeys: Array<string> = new Array<string>();
    allUserRoles?.forEach(role => {
      let result = getEnumKeyByEnumValue(Roles, role);
      if (result !== null) {
        userRolesAsEnumKeys.push(result);
      }
    });
    
    //Intersection of possible Admin roles and current admin roles
    const userAdminRolesAsEnumKeys: Array<string> = allAdminRolesAsEnumKeys.filter(role => userRolesAsEnumKeys.includes(role));

    //Roles are converted  to AdminRole enum  
    const currentUserAdminRoles = new Array<AdminRole>();
    userAdminRolesAsEnumKeys.forEach(role => {
      currentUserAdminRoles.push(AdminRole[role as keyof typeof AdminRole]);
    })

    return currentUserAdminRoles;
  };

  //Takes user Plast roles, writes them in array in descending order (as in NonAdminRole enum)
  const setUserNonAdminRoles = (allUserRoles: Array<string>): Array<NonAdminRole> => {

    //All possible NonAdminRole keys are converted to string array
    const allAdminRolesAsEnumKeys: Array<string> = new Array<string>();
    for(var key in NonAdminRole) {
      allAdminRolesAsEnumKeys.push(NonAdminRole[key]);
    }

    //Current user roles as strings (values) are converted to corresponding
    //Roles enum keys, which are also saved as array of string
    const userRolesAsEnumKeys: Array<string> = new Array<string>();
    allUserRoles?.forEach(role => {
      let result = getEnumKeyByEnumValue(Roles, role);
      if (result !== null) {
        userRolesAsEnumKeys.push(result);
      }
    });
    
    //Intersection of possible NonAdmin roles and current admin roles
    const userNonAdminRolesAsEnumKeys: Array<string> = allAdminRolesAsEnumKeys.filter(role => userRolesAsEnumKeys.includes(role));

    //Roles are converted to NonAdminRole enum  
    const userNonAdminRoles = new Array<NonAdminRole>();
    userNonAdminRolesAsEnumKeys.forEach(role => {
      userNonAdminRoles.push(NonAdminRole[role as keyof typeof NonAdminRole]);
    })

    return userNonAdminRoles;
  };

  const roles = UserApi.getActiveUserRoles();

  useEffect(() => {
    const buildChain = async () => {
      const builder: DropdownItemCreator = new DropdownItemCreator();
      setChainOfAccessibility(builder.build());
    };
    buildChain();
  }, []);

  const lookThroughChain = async () => {
    chainOfAccessibility?.handle(currentUser, setUserAdminRoles(roles), selectedUser, 
      setUserAdminRoles(selectedUserRoles), setUserNonAdminRoles(selectedUserRoles));

    return chainOfAccessibility?.getHandlersResults();
  }

  const fetchUser = async () => {

    const result: Map<DropdownFunc, any> | undefined | null = await lookThroughChain();

    //To make changes in user access for context menu look in DropdownItem.tsx
    
    setCanViewProfile(result?.get(DropdownFunc.CheckProfile) ?? false);

    setCanDelete(result?.get(DropdownFunc.Delete) ?? false);
    
    setCanChangeRegionAdministration(result?.get(DropdownFunc.EditRegion) ?? false);

    setCanChangeCityAdministration(result?.get(DropdownFunc.EditCity) ?? false);

    setCanChangeClubAdministration(result?.get(DropdownFunc.EditClub) ?? false);
      
    setCanChangeUserAccess(result?.get(DropdownFunc.EditRole) ?? false);

    setCanAddDegree(result?.get(DropdownFunc.AddDegree) ?? false);

    setSuperAdmin(currentUserAdminRoles.includes(AdminRole.Admin));
    setGoverningBodyHead(currentUserAdminRoles.includes(AdminRole.GoverningBodyHead));
  };

  useEffect(() => {
    fetchUser();
  }, [selectedUser]);

  const handleItemClick = async (item: any) => {
    switch (item.key) {
      case "1":
        window.open(`/userpage/main/${record}`);
        break;
      case "2":
        await userDeleteCofirm(record, onDelete);
        break;
      case "3":
        await setShowRegionModal(true);
        break;
      case "4":
        await setShowCityModal(true);
        break;
      case "5":
        await setShowClubModal(true);
        break;
      case "6":
        await setShowEditModal(true);
        break;
      case "7":
        await setVisibleModalDegree(true);
        break;
      case "8":
        await adminApi.putExpiredRole(record);
        break;
      case "9":
        await authService.resendEmailForRegistering(record);
        break;
      default:
        break;
    }
    item.key = "0";
  };

  return (
    <>
      {canView ? <Menu
        theme="dark"
        className={classes.menu}
        onClick={handleItemClick}
        style={{
          top: pageY,
          left:
            window.innerWidth - (pageX + 223) < 0
              ? window.innerWidth - 266
              : pageX,
          display: showDropdown ? "block" : "none",
        }}
      >
        {props.inActiveTab === false && canViewProfile ? (
          <Menu.Item key="1">
            <FileSearchOutlined />
            ?????????????????????? ??????????????
          </Menu.Item>
        ) : (
          <> </>
        )}
        {props.inActiveTab === false && canDelete ? (
          <Menu.Item key="2">
            <DeleteOutlined />
            ????????????????
          </Menu.Item>
        ) : (
          <> </>
        )}
        {props.inActiveTab === false && canChangeRegionAdministration ? (
          <Menu.Item key="3">
            <EditOutlined />
            ???????????? ????????????
          </Menu.Item>
        ) : (
          <> </>
        )}
        {props.inActiveTab === false && canChangeCityAdministration ? (
          <Menu.Item key="4">
            <EditOutlined />
            ???????????? ??????????????
          </Menu.Item>
        ) : (
          <> </>
        )}
        {props.inActiveTab === false && canChangeClubAdministration ? (
          <Menu.Item key="5" >
            <EditOutlined />
            ???????????? ????????????
          </Menu.Item>
        ) : (
          <> </>
        )}
        {props.inActiveTab === false && canChangeUserAccess ? (
          <Menu.Item key="6">
            <EditOutlined />
            ???????????????? ???????? ??????????????????????
          </Menu.Item>
        ) : (
          <> </>
        )}
        {props.inActiveTab === false && canAddDegree ? (
          <Menu.Item key="7">
            <PlusCircleOutlined />
            ???????????? ??????????????
          </Menu.Item>
        ) : (
          <> </>
        )}
        {props.inActiveTab === false && superAdmin ? (
          <Menu.Item key="9">
            <MailOutlined />
            ????????????????????
          </Menu.Item>
        ) : (
          <> </>
        )}
        <ChangeUserRoleModal
          record={record}
          showModal={showEditModal}
          setShowModal={setShowEditModal}
          onChange={onChange}
          user={selectedUser}
        />
        <ChangeUserCityModal
          record={record}
          showModal={showCityModal}
          setShowModal={setShowCityModal}
          user={selectedUser}
          onChange={onChange}
        />
        <ChangeUserRegionModal
          record={record}
          showModal={showRegionModal}
          setShowModal={setShowRegionModal}
          onChange={onChange}
          user={selectedUser}
        />
        <ChangeUserClubModal
          record={record}
          showModal={showClubModal}
          user={selectedUser}
          setShowModal={setShowClubModal}
          onChange={onChange}
        />
        <ModalAddPlastDegree
          handleAddDegree={() => { }}
          userId={record}
          visibleModal={visibleModalDegree}
          setVisibleModal={setVisibleModalDegree}
        />
      </Menu> : null}
    </>
  );
};

export default DropDown;
