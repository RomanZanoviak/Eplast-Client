import React, { useEffect, useState } from 'react';
import { Table, Input, Button, Layout, Modal } from 'antd';
import columns from './columns';
import notificationLogic from '../../../components/Notifications/Notification';
import UserDistinction from '../Interfaces/UserDistinction';
import DropDownDistinctionTable from './DropDownDistinctionTable';
import distinctionApi from '../../../api/distinctionApi';
import AddDistinctionModal from '../DistinctionTable/AddDistinctionModal';
import EditDistinctionTypesModal from './EditDistinctionTypesModal';
import ClickAwayListener from 'react-click-away-listener';
import User from '../../../models/UserTable/User';

const classes = require('./Table.module.css');

const { Content } = Layout;
const DecisionTable = () => {
  const [recordObj, setRecordObj] = useState<any>(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [visibleModal, setVisibleModal] = useState(false);
  const [visibleModalEditDist, setVisibleModalEditDist] = useState(false);
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchedData, setSearchedData] = useState('');
  const [UserDistinctions, setData] = useState<UserDistinction[]>([{
      id: 0,
      distinction: 
      {
        id: 0,
        name: ''
      },
        distinctionId: 0,
        userId: '',
        reporter: '',
        reason: '',
        date: new Date(),
        user: new User()
    }]);

    useEffect(() => {
      const fetchData = async () => {
        setLoading(true);
        const res: UserDistinction[] = await distinctionApi.getUserDistinctions();
        setData(res);
        setLoading(false);
      };
      fetchData();
    }, []);

    let filteredData = searchedData
    ? UserDistinctions.filter((item: any) => {
      return Object.values(item).find((element) => {
        return String(element).includes(searchedData)
      });
    })
    : UserDistinctions;

  filteredData = filteredData.concat(
    UserDistinctions.filter((item) => (item.user.firstName?.includes(searchedData)||
    item.user.lastName?.includes(searchedData)) && !filteredData.includes(item)
    )
  )
  filteredData = filteredData.concat(
    UserDistinctions.filter((item) => item.distinction.name?.includes(searchedData) && !filteredData.includes(item)
    )
  )
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchedData(event.target.value);
  };

    const showModal = () => {
    
      setVisibleModal(true);
    };

    const handleAdd = async() => {
    
      setVisibleModal(false);
      setLoading(true);
      const res: UserDistinction[] = await distinctionApi.getUserDistinctions();
      setData(res);
      setLoading(false);
      notificationLogic('success', "Відзначення успішно додано!");
     
    };

    const showModalEditTypes = () => {
      setVisibleModalEditDist(true);
    }


    const handleClickAway=()=>{
      setShowDropdown(false);
    }

    const handleDelete = (id: number) => {
      const filteredData = UserDistinctions.filter((d: { id: number; }) => d.id !== id);
      setData([...filteredData]);
      notificationLogic('success', "Відзначення успішно видалено!");
    }

return (
    <Layout>
      <Content onClick={() => { setShowDropdown(false) }} >
        <h1 className={classes.titleTable}>Відзначення</h1>
        {loading && <Table loading />}
        {!loading && (
          <>
            <div className={classes.searchContainer}>
              <Input placeholder="Пошук" onChange={handleSearch} />
              <Button type="primary" onClick = {showModal}>
                Додати відзначення
              </Button>
              <Button type="primary" onClick = {showModalEditTypes}>
                Редагування типів відзначень
              </Button>
            </div>
            <Table
              dataSource={filteredData}
              columns={columns} 
              onRow={(record) => {
                return {
                    onClick: () => {
                        setShowDropdown(false);
                    },
                    onContextMenu: (event) => {
                        event.preventDefault();
                        setShowDropdown(true);
                        setRecordObj(record.id);
                        setX(event.pageX);
                        setY(event.pageY);
                    },
                };
            }}
              bordered
              rowKey="id"
            />
            <ClickAwayListener onClickAway={handleClickAway}>
                  <DropDownDistinctionTable
                    showDropdown={showDropdown}
                    onDelete={handleDelete}
                    record={recordObj}
                    pageX={x}
                    pageY={y}
                />
                </ClickAwayListener>

                <AddDistinctionModal 
                  setVisibleModal={setVisibleModal}
                  visibleModal={visibleModal}
                  onAdd={handleAdd}
              />
              <EditDistinctionTypesModal 
              setVisibleModal = {setVisibleModalEditDist}
              visibleModal = {visibleModalEditDist}/>
          </>
        )}
      </Content>

    </Layout>
  );
}
export default DecisionTable;
