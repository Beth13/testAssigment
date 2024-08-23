/* eslint-disable react/prop-types */
import { DataGrid } from '@mui/x-data-grid';
import { useCallback } from 'react';
import OutOfServiceChart from '../../Charts/BarChart';
import { formatDate, parseDate } from '../../../utils/dates';

const SimpleTable = ({ data, setData, saveDataToIndexedDB }) => {
  const processRowUpdate = useCallback(
    async (newRow) => {
      const updatedRows = data.rows.map((row) => {
        if (row.id === newRow.id) {
          return { ...row, ...newRow };
        }
        return row;
      });

      const validatedRows = updatedRows.map((row, index) => ({
        ...row,
        id: row.id !== undefined ? row.id : index,
      }));

      const updatedData = { ...data, rows: validatedRows };
      setData(updatedData);
      await saveDataToIndexedDB(updatedData);

      return newRow;
    },
    [data, setData, saveDataToIndexedDB]
  );

  const onProcessRowUpdateError = useCallback((err) => {
    alert(err);
  }, []);

  const handleRowModesModelChange = useCallback(
    (newModel) => {
      setData(newModel);
    },
    [setData]
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-6 ">
        <OutOfServiceChart columns={data.columns} rows={data.rows} />
        <h3 className="text-2xl font-semibold">Simple Table</h3>
        <DataGrid
          rows={data.rows}
          columns={data.columns.map((item) => ({
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
          getRowId={(row) => row.id}
          pagination
          paginationMode="client"
          autoHeight
          processRowUpdate={processRowUpdate}
          onProcessRowUpdateError={onProcessRowUpdateError}
          onRowModesModelChange={handleRowModesModelChange}
        />
      </div>
    </div>
  );
};

export default SimpleTable;
