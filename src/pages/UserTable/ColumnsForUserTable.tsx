import React, { useState } from "react";
import moment from "moment";
import { Tooltip, Tag, Row, Col, Checkbox, Button } from "antd";
import {
  WomanOutlined,
  ManOutlined,
  CaretUpOutlined,
  CaretDownOutlined,
} from "@ant-design/icons";
import "./Filter.less";
import Transgender from '../../assets/images/lgbt.svg'
import { Roles } from "../../models/Roles/Roles";
import "../AnnualReport/AnnualReportTable/AnnualReportTable.less";
import styles from './UserTable.module.css';

const setTagColor = (userRoles: string) => {
  let color = "";
  if (userRoles?.includes(Roles.Admin)) {
    color = "red";
  }
  if (userRoles?.includes(Roles.PlastMember)) {
    color = "green";
  }
  if (userRoles?.includes(Roles.Supporter)) {
    color = "orange";
  }
  if (userRoles?.includes(Roles.Interested)) {
    color = "yellow";
  }
  if (userRoles?.includes(Roles.FormerPlastMember)) {
    color = "black";
  }
  if (userRoles?.includes(Roles.RegisteredUser)) {
    color = "blue"
  }
  return color;
};

const options = [
  { label:  Roles.PlastMember,       value: Roles.PlastMember,        },
  { label:  Roles.FormerPlastMember, value: Roles.FormerPlastMember,  },
  { label:  Roles.Supporter,         value: Roles.Supporter,          },
  { label:  Roles.OkrugaHead,        value: Roles.OkrugaHead,         },
  { label:  Roles.OkrugaSecretary,   value: Roles.OkrugaSecretary,    },
  { label:  Roles.CityHead,          value: Roles.CityHead,           },
  { label:  Roles.CitySecretary,     value: Roles.CitySecretary,      },
  { label:  Roles.KurinHead,         value: Roles.KurinHead,          },
  { label:  Roles.KurinSecretary,    value: Roles.KurinSecretary,     },
  { label:  Roles.RegisteredUser,    value: Roles.RegisteredUser,     },
];

interface Props {
  sortKey: number;
  setSortKey: any;
  setFilter: any;
  setPage: any;
  filterRole: any;
}

const ColumnsForUserTable = (props: Props): any[] => {

  const { sortKey, setSortKey, setFilter, setPage, filterRole } = props;

  const numberOfElementsInFilter: number = 10;
  const defaultPage: number = 1;

  const [filterDropdownVisible, setFilterDropdownVisible] = useState<boolean>(false);
  const [filterOptions, setFilterOptions] = useState<any>(options);
  const [filterStatus, setFilterStatus] = useState({value: Array<boolean>(numberOfElementsInFilter).fill(false)});

  const onChangeCheckbox = (e: any, i: number) => {
    let value = filterStatus.value.slice();
    value[i] = !value[i];
    setFilterStatus({value});
  }

  const onSearchFilter = () => {
    const rolesToStr = new Array<string>();
    filterStatus.value.forEach((element: boolean, index: number) => {
      if (element) {
        rolesToStr.push(filterOptions[index].value.toString());
      }
    });
    setFilterDropdownVisible(false);
    setPage(defaultPage);
    setFilter(rolesToStr);
  }

  const onClearFilter = () => {
    setFilterStatus({value: Array<boolean>(numberOfElementsInFilter).fill(false)});
    setFilterDropdownVisible(false);
    setPage(defaultPage);
    setFilter([]);
  }

  const SortDirection = (props: {sort: number}) => {
    return<>
      <div className={"tableHeaderSorting"}>
        <button onClick={() => {setSortKey( props.sort)}} className={sortKey=== props.sort? "sortDirection":""}><CaretUpOutlined /></button>
        <button onClick={() => {setSortKey(-props.sort)}} className={sortKey===-props.sort? "sortDirection":""}><CaretDownOutlined /></button>
      </div>
    </>
  }

  const SortColumnHighlight = (sort: number, text: any) => {
    return {
      props: {
        style: { backgroundColor: (sortKey===sort || sortKey===-sort)? "#fafafa" : "", }
      },
      children: <div>{text}</div>
    };
  }

  return [
    {
      title: <Row className="tableHeader"><Col>???</Col><Col><SortDirection sort={1} /></Col></Row>,
      render: (id: any) => {
        return SortColumnHighlight(1, 
          <div className={styles.divWrapper}>
            <div className={styles.tagText}>
              <Tooltip placement="top" title={id}>
                {id}
              </Tooltip>
            </div>
          </div>
        );
      },
      dataIndex: "userSystemId",
      fixed: true,
      width: 75,
    },
    {
      title: <Row className="tableHeader"><Col>????'??</Col><Col><SortDirection sort={2} /></Col></Row>,
      dataIndex: "firstName",
      width: 150,
      render: (firstName: any) => {
        return SortColumnHighlight(2, 
          <div className={styles.divWrapper}>
            <div className={styles.tagText}>
              <Tooltip placement="top" title={firstName}>
                {firstName}
              </Tooltip>
            </div>
          </div>
        );
      },
    },
    {
      title: <Row className="tableHeader"><Col>????????????????</Col><Col><SortDirection sort={3} /></Col></Row>,
      dataIndex: "lastName",
      width: 150,
      render: (lastName: any) => {
        return SortColumnHighlight(3, 
          <div className={styles.divWrapper}>
            <div className={styles.tagText}>
              <Tooltip placement="top" title={lastName}>
                {lastName}
              </Tooltip>
            </div>
          </div>
        );
      },
    },
    {
      title: <Row className="tableHeader"><Col>???????? ????????????????????</Col><Col><SortDirection sort={4} /></Col></Row>,
      dataIndex: "birthday",
      width: 130,
      render: (date: Date) => {
        return SortColumnHighlight(4, <>{date !== null ? moment.utc(date.toLocaleString()).local().format("DD.MM.YYYY") : ""}</>);
      },
    },
    {
      title: "??????????",
      dataIndex: "gender",
      width: 80,
      render: (gender: any) => {
        if (gender === null) {
          return (
            <h4>???? ??????????????</h4>
          );
        } else if (gender.name === "??????????") {
          return (
            <Tooltip title="??????????">
              <WomanOutlined />
            </Tooltip>
          );
        } else if (gender.name === "??????????????") {
          return (
            <Tooltip title="??????????????">
              <ManOutlined />
            </Tooltip>
          );
        } else {
          return (
            <Tooltip title="???? ?????? ?????????????? ??????????????????">
                <img src={Transgender} alt="Transgender"/>
            </Tooltip>
          );
        }
      },
    },
    {
      title: "Email",
      dataIndex: "email",
      width: 160,
      render: (email: any) => {
        return (
          <div className={styles.divWrapper}>
            <div className={styles.tagText}>
              <Tooltip placement="top" title={email}>
                {email}
              </Tooltip>
            </div>
          </div>
        );
      },
    },
    {
      title: <Row className="tableHeader"><Col>????????????</Col><Col><SortDirection sort={5} /></Col></Row>,
      dataIndex: "regionName",
      width: 110,
      render: (regionName: any) => {
        return SortColumnHighlight(5, regionName == null ? "" : 
          <div className={styles.parentDiv}>
            <Tag color={"blue"} key={regionName} className={styles.tagText}> 
              <Tooltip placement="topLeft" title={regionName}>
                {regionName}
              </Tooltip> 
            </Tag>
          </div>
        );
      }, 
    },
    {
      title: <Row className="tableHeader"><Col>??????????????</Col><Col><SortDirection sort={6} /></Col></Row>,
      dataIndex: "cityName",
      width: 120,
      render: (cityName: any) => {
        return SortColumnHighlight(6, cityName == null ? "" :
          <div className={styles.parentDiv}>
            <Tag color={"purple"} key={cityName} className={styles.tagText}>
              <Tooltip placement="topLeft" title={cityName} >
                {cityName}
              </Tooltip> 
            </Tag>
          </div>
        );
      },
    },
    {
      title: <Row className="tableHeader"><Col>????????????</Col><Col><SortDirection sort={7} /></Col></Row>,
      dataIndex: "clubName",
      width: 150,
      render: (clubName: any) => {
        return SortColumnHighlight(7, clubName == null ? "" :
          <div className={styles.parentDiv}>
            <Tag color={"pink"} key={clubName} className={styles.tagText}>
              <Tooltip placement="topLeft" title={clubName}>
                {clubName}
              </Tooltip> 
            </Tag>
          </div>
        );
      },
    },
    {
      title: <Row className="tableHeader"><Col>??????????????</Col><Col><SortDirection sort={8} /></Col></Row>,
      dataIndex: "userPlastDegreeName",
      width: 150,
      render: (userPlastDegreeName: any, record: any) => {
        if (userPlastDegreeName !== null && userPlastDegreeName.length > 0) {
          if (record.gender?.name !== null && record.gender?.name == "??????????????") {
            return SortColumnHighlight(8, 
              <div className={styles.parentDiv}>
                <Tag color={"blue"} key={userPlastDegreeName} className={styles.tagText}>
                  <Tooltip placement="topLeft" title={userPlastDegreeName?.includes("/") ? userPlastDegreeName?.split("/")[0] : userPlastDegreeName}>
                    {userPlastDegreeName?.includes("/") ? userPlastDegreeName?.split("/")[0] : userPlastDegreeName}
                  </Tooltip> 
                </Tag>
              </div>
            );
          } else if (record.gender?.name !== null && record.gender?.name == "??????????") {
              return SortColumnHighlight(8, 
                <div className={styles.parentDiv}>
                  <Tag color={"red"} key={userPlastDegreeName} className={styles.tagText}>
                    <Tooltip placement="topLeft" title={userPlastDegreeName?.includes("/") ? userPlastDegreeName?.split("/")[1] : userPlastDegreeName}>
                      {userPlastDegreeName?.includes("/") ? userPlastDegreeName?.split("/")[1] : userPlastDegreeName}
                    </Tooltip>
                  </Tag>
                </div>
              );
          } else {
            return SortColumnHighlight(8, 
              <div className={styles.parentDiv}>
                <Tag color={"yellow"} key={userPlastDegreeName} className={styles.tagText}>
                  <Tooltip placement="topLeft" title={userPlastDegreeName}>
                    {userPlastDegreeName}
                  </Tooltip>
                </Tag>
              </div>
            );
          }
        } else {
          return SortColumnHighlight(8, "");
        }
      },
    },
    {
      title: <Row className="tableHeader"><Col>?????????????? ?? ??????</Col><Col><SortDirection sort={9} /></Col></Row>,
      dataIndex: "upuDegree",
      width: 210,
      render: (upuDegree: any) => {
        return SortColumnHighlight(9, 
          <div className={styles.parentDiv}>
            <Tag color={"blue"} key={upuDegree} className={styles.tagText}>
              <Tooltip placement="topLeft" title={upuDegree}>
                {upuDegree}
              </Tooltip>
            </Tag>
          </div>
        );
      },
    },
    {
      title: "?????????? ??????????????",
      dataIndex: "userRoles",
      width: 170,
      ellipsis: false,
      filterDropdownVisible: filterDropdownVisible,
      filterDropdown: (
        <div className={styles.customFilterDropdown}>
          {filterOptions.map((item: any, i: number) => 
            <div>
              <Checkbox 
                key={i}
                value={item.value}
                checked={filterStatus.value[i]}
                onChange={(e) => onChangeCheckbox(e, i)}
                className={styles.filterElement}
              >
                {item.label}
              </Checkbox>
              <br />
            </div>
          )}
          <div>
            <Button className={styles.filterButton} onClick={onClearFilter}>??????????????</Button>
            <Button className={styles.filterButton} type="primary" onClick={onSearchFilter}>??????????</Button>
          </div>
        </div>
      ),
      onFilterDropdownVisibleChange: () => setFilterDropdownVisible(!filterDropdownVisible),
      render: (userRoles: any) => {
        return (
          <div className={styles.parentDiv}>
            <Tag color={setTagColor(userRoles)} key={userRoles} className={styles.tagText}>
              <Tooltip placement="leftTop" title={userRoles}>
                {userRoles}
              </Tooltip>
            </Tag>
          </div>
        );
      },
    },
  ]
};

export default ColumnsForUserTable;
