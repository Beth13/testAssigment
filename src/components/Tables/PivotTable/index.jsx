/* eslint-disable react/prop-types */
import { useMemo, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import moment from 'moment';
import { MenuItem, Select } from '@mui/material';

import { formatDate, parseDate } from '../../../utils/dates';
import OutOfServiceChart from '../../Charts/BarChart';

const dateRangeOptions = [
  { label: 'Last Week of 2023', value: 'lastWeek' },
  { label: 'Last Month of 2023', value: 'lastMonth' },
  { label: 'Last Year of 2023', value: 'lastYear' },
];

const PivotTable = ({ data }) => {
  const [dateRange, setDateRange] = useState('lastWeek');

  const referenceDate = moment('2023-12-31');

  const filteredRows = useMemo(() => {
    const dateField = data.columns.find((col) => col.headerName === 'Created dt');
    if (!dateField) return data.rows;

    const filterFunction = {
      lastWeek: (date) =>
        moment(date).isBetween(
          referenceDate.clone().subtract(1, 'weeks').startOf('week'),
          referenceDate,
          undefined,
          '[]'
        ),
      lastMonth: (date) =>
        moment(date).isBetween(
          referenceDate.clone().subtract(1, 'months').startOf('month'),
          referenceDate,
          undefined,
          '[]'
        ),
      lastYear: (date) =>
        moment(date).isBetween(
          referenceDate.clone().subtract(1, 'years').startOf('year'),
          referenceDate,
          undefined,
          '[]'
        ),
    };

    const filter = filterFunction[dateRange];

    return data.rows.filter((row) => {
      const createdAt = row[dateField.field];
      if (!createdAt) return false;

      const parsedDate = parseDate(createdAt);
      return filter(parsedDate);
    });
  }, [data, dateRange, referenceDate]);

  const pivotColumns = useMemo(() => {
    return data.columns.map((col) => ({
      ...col,
      width: 150,
    }));
  }, [data]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-6 ">
        <OutOfServiceChart columns={data.columns} rows={filteredRows} />
        <h3 className="text-2xl font-semibold">Pivot Table</h3>
        <Select value={dateRange} onChange={(e) => setDateRange(e.target.value)} label="Date Range">
          {dateRangeOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
        <DataGrid
          rows={filteredRows}
          columns={pivotColumns.map((item) => ({
            ...item,
            editable: true,
            type: item.headerName.toLowerCase().includes('dt')
              ? 'date'
              : item.headerName.toLowerCase().includes('number')
              ? 'number'
              : 'text',
            valueGetter: (params) => {
              return item.type === 'date' ? parseDate(params) : params;
            },
            valueFormatter: (params) => {
              return item.type === 'date' && params instanceof Date ? formatDate(params) : params;
            },
          }))}
          pageSize={10}
          rowsPerPageOptions={[10, 20, 50]}
          autoHeight
          disableSelectionOnClick
        />
      </div>
    </div>
  );
};

export default PivotTable;
