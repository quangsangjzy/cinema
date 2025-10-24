import React, { useEffect, useState } from 'react';
import { BarChart } from '@mui/x-charts';
import { LineChart } from '@mui/x-charts';
import usersApi from '../../api/usersApi';

export default function MoviesManagement() {
  const [phim, setPhim] = useState([]);
  const [revenue, setRevenue] = useState([]);

  useEffect(() => {
    usersApi.getMonth()
      .then(response => {
        console.log(response.data);
        setRevenue(response.data);
      })
      .catch(error => {
        console.error('Error fetching revenue:', error);
      });
  }, []);

  useEffect(() => {
    usersApi.getPhim()
      .then(response => {
        console.log(response.data);
        setPhim(response.data);
      })
      .catch(error => {
        console.error('Error fetching phim:', error);
      });
  }, []);

  return (
    <div style={{ height: '100vh', width: '100%', paddingBottom: '150px' }}>
      <h3>Thông kê theo từng tháng</h3>
      {revenue.length > 0 ? (
        <BarChart
          xAxis={[
            {
              id: 'barCategories',
              data: revenue.map(item => 'Tháng ' + item.thang ),
              scaleType: 'band',
            },
          ]}
          series={[
            {
              data: revenue.map(item => item.doanhSo),
            },
          ]}
          width={1500}
          height={350}
          margin={{ top: 20, right: 30, bottom: 50, left: 100 }}
        />
      ) : (
        <p>Loading...</p>
      )}
      <br />
      <h3>Thống kê phim xem nhiều nhất</h3>
      {phim.length > 0 ? (

        <BarChart
          xAxis={[
            {
              id: 'barCategories',
              data:  phim.map(item => item.tenPhim),
              scaleType: 'band',
            },
          ]}
          series={[
            {
              data: phim.map(item => item.soLuong),
            },
          ]}
          width={1500}
          height={350}
          margin={{ top: 20, right: 30, bottom: 50, left: 100 }}
        />
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}