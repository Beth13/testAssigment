import { useEffect, useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { Button, CircularProgress, Tab, Tabs } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

import PivotTable from '../../components/Tables/PivotTable';
import SimpleTable from '../../components/Tables/SimpleTable';

import {
  deleteDatabaseWithConfirmation,
  loadDataFromIndexedDB,
  saveDataToIndexedDB,
} from '../../utils/db';
import { excelSerialToJSDate } from '../../utils/dates';
import { capitalizeFirstLetter, convertStatus } from '../../utils/stringFormat';

const NAV_TABS = [
  {
    label: 'Simple table',
    value: 'simple',
  },
  {
    label: 'Pivot table ',
    value: 'pivot',
  },
];

const ExcelToTables = () => {
  const [data, setData] = useState({ rows: [], columns: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(NAV_TABS.at(0)?.value);
  const fileInputRef = useRef(null);

  const handleFileUpload = (event) => {
    setIsLoading(true);
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onload = async (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (jsonData.length) {
        const headers = jsonData.at(0).map((header, index) => {
          let sampleData = jsonData[1] ? jsonData[1][index] : '';
          let type = typeof sampleData;

          if (type === 'string' && !isNaN(Date.parse(sampleData))) {
            type = 'date';
          } else if (type === 'string' && !isNaN(parseFloat(sampleData))) {
            type = 'number';
          }

          return {
            field: index.toString(),
            headerName: capitalizeFirstLetter(convertStatus(header)),
            width: 150,
            editable: true,
            type: type,
          };
        });

        const rows = jsonData.slice(1).map((row, index) => {
          const rowData = {};

          row.forEach((cell, cellIndex) => {
            if (typeof cell === 'number' && cell > 40000) {
              rowData[cellIndex.toString()] = excelSerialToJSDate(cell).toLocaleDateString();
            } else {
              rowData[cellIndex.toString()] = cell;
            }
          });

          return { id: index, ...rowData };
        });

        const newData = { rows, columns: headers };

        setData(newData);
        await saveDataToIndexedDB(newData);

        setIsLoading(false);
        fileInputRef.current.value = null;
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const TABLES = {
    simple: <SimpleTable data={data} saveDataToIndexedDB={saveDataToIndexedDB} setData={setData} />,
    pivot: <PivotTable data={data} />,
  };

  useEffect(() => {
    setIsLoading(true);

    loadDataFromIndexedDB().then((savedData) => {
      if (savedData) {
        setData(savedData);
      }
      setIsLoading(false);
    });
  }, []);

  return (
    <div className="wrapper">
      <div className="flex items-center w-full justify-between">
        <input
          type="file"
          accept=".xlsx, .xls"
          className="w-[fit-content]"
          onChange={handleFileUpload}
          disabled={isLoading}
          ref={fileInputRef}
        />
        <Button
          variant="contained"
          startIcon={<DeleteIcon />}
          onClick={() => {
            deleteDatabaseWithConfirmation();
          }}
        >
          Clear data
        </Button>
      </div>
      {isLoading ? (
        <div className="flex items-center m-auto h-full">
          <CircularProgress disableShrink />
        </div>
      ) : (
        <>
          <Tabs
            value={activeTab}
            onChange={(_, tab) => setActiveTab(tab)}
            variant="scrollable"
            scrollButtons={false}
          >
            {NAV_TABS.map(({ label, value }) => (
              <Tab key={value} label={label} value={value} />
            ))}
          </Tabs>
          {data.columns.length ? (
            TABLES[activeTab]
          ) : (
            <div className="flex w-full h-full items-center justify-center">Upload file</div>
          )}
        </>
      )}
    </div>
  );
};

export default ExcelToTables;
