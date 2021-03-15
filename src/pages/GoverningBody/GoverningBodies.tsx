import React, { useEffect, useState } from "react";
import { useHistory, useRouteMatch, Link } from "react-router-dom";
import { Card, Layout, Pagination, Result, Skeleton } from "antd";
import Add from "../../../assets/images/add.png";
import GoverningBodyDefaultLogo from "../../../assets/images/default_city_image.jpg";
import { getGoverningBodiesByPage, getLogo } from "../../api/governingBodiesApi";
import "../City/Cities/Cities.less";
import GoverningBodyProfile from "../../models/GoverningBody/GoverningBodyProfile";
import Title from "antd/lib/typography/Title";
import Spinner from "../Spinner/Spinner";
import Search from "antd/lib/input/Search";

const GoverningBodies = () => {
  const history = useHistory();
  const { url } = useRouteMatch();

  const [governingBodies, setGoverningBodies] = useState<GoverningBodyProfile[]>([]);
  const [canCreate, setCanCreate] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [photosLoading, setPhotosLoading] = useState<boolean>(false);
  const [searchedData, setSearchedData] = useState("");

  const setPhotos = async (governingBodies: GoverningBodyProfile[]) => {
    for await (const governingBody of governingBodies) {
      if (governingBody.logo === null) {
        governingBody.logo = GoverningBodyDefaultLogo;
      } else {
        const logo = await getLogo(governingBody.logo);
        governingBody.logo = logo.data;
      }
    }

    setPhotosLoading(false);
  };
  const getGoverningBodies = async () => {
    setLoading(true);

    try {
      const response = await getGoverningBodiesByPage(
        page,
        pageSize,
        searchedData.trim()
      );

      setPhotosLoading(true);
      setPhotos(response.data.governingBodies);
      setGoverningBodies(response.data.governingBodies);
      setCanCreate(response.data.canCreate);
      setTotal(response.data.total);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (page: number) => {
    setPage(page);
  };

  const handleSizeChange = (page: number, pageSize: number = 10) => {
    setPage(page);
    setPageSize(pageSize);
  };

  useEffect(() => {
    getGoverningBodies();
  }, [page, pageSize, searchedData]);

  const handleSearch = (event: any) => {
    setPage(1);
    setSearchedData(event);
  };
  return (
    <Layout.Content className="cities">
      <Title level={1}>Керівні оргіни</Title>
      <div className="searchContainer">
        <Search
          placeholder="Пошук"
          enterButton
          onSearch={handleSearch}
          loading={photosLoading}
          disabled={photosLoading}
        />
      </div>
      {loading ? (
        <Spinner />
      ) : (
          <div>
            <div className="cityWrapper">
              {canCreate && page === 1 && searchedData.length === 0 ? (
                <Card
                  hoverable
                  className="cardStyles addCity"
                  cover={<img src={Add} alt="AddGoverningBody" />}
                  onClick={() => history.push(`${url}/new`)}
                >
                  <Card.Meta
                    className="titleText"
                    title="Створити новий керівний орган"
                  />
                </Card>
              ) : null}

              {governingBodies.length === 0 && searchedData.length !== 0 ? (
                <div>
                  <Result status="404" title="Керівний орган не знайдено" />
                </div>
              ) : (
                governingBodies.map((governingBody: GoverningBodyProfile) => (
                    <Link to={`${url}/${governingBody.id}`}>
                      <Card
                        key={governingBody.id}
                        hoverable
                        className="cardStyles"
                        cover={
                          photosLoading ? (
                            <Skeleton.Avatar shape="square" active />
                          ) : (
                              <img src={governingBody.logo || undefined} alt="GoverningBody" />
                            )
                        }
                        onClick={() => history.push(`${url}/${governingBody.id}`)}
                      >
                        <Card.Meta title={governingBody.name} className="titleText" />
                      </Card>
                    </Link>
                  ))
                )}
            </div>
            <div className="pagination">
              <Pagination
                current={page}
                pageSize={pageSize}
                total={total}
                responsive
                showLessItems
                onChange={(page) => handleChange(page)}
                onShowSizeChange={(page, size) => handleSizeChange(page, size)}
              />
            </div>
          </div>
        )}
    </Layout.Content>
  );
};
export default GoverningBodies;