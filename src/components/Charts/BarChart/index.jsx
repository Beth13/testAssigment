/* eslint-disable react/prop-types */
import { useMemo, useState } from 'react';
import { MenuItem, Select } from '@mui/material';
import moment from 'moment';
import { BarChart } from '@mui/x-charts';

const OutOfServiceChart = ({ columns, rows }) => {
  const [column, setColumn] = useState('21');

  const COLUMNS_SORT = columns?.filter(({ headerName }) =>
    [
      'Entity type',
      'Operating status',
      'M city',
      'M state',
      'Mcs 150 form date',
      'Out of service date',
      'Credit score',
      'Record status',
    ].includes(headerName)
  );

  const handleChange = (event) => {
    setColumn(event.target.value);
  };

  const aggregateData = useMemo(() => {
    const counts = rows.reduce((acc, curr) => {
      const value = curr[column];

      if (value) {
        if (['21', '22'].includes(column)) {
          const monthYear = moment(value, 'MM/DD/YYYY').format('YYYY-MM');
          acc[monthYear] = (acc[monthYear] || 0) + 1;
        } else {
          acc[value] = (acc[value] || 0) + 1;
        }
      }

      return acc;
    }, {});

    return counts;
  }, [column, rows]);

  const xAxisData = useMemo(() => Object.keys(aggregateData).sort(), [aggregateData]);
  const seriesData = useMemo(
    () => xAxisData.map((key) => aggregateData[key]),
    [xAxisData, aggregateData]
  );

  return (
    <div>
      <Select id="simple-select" value={column} label="type" onChange={handleChange}>
        {COLUMNS_SORT.map((item) => (
          <MenuItem key={item.field} value={item.field}>
            {item.headerName}
          </MenuItem>
        ))}
      </Select>
      <BarChart
        xAxis={[{ scaleType: 'band', data: xAxisData }]}
        series={[{ data: seriesData }]}
        width={800}
        height={250}
      />
    </div>
  );
};

export default OutOfServiceChart;
