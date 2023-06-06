import React, { useEffect, useState, useMemo } from "react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { TextField } from "@mui/material";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};
export default function Home() {
  const [data, setData] = useState([]);

  const [order, setOrder] = useState("");

  const [sortField, setSortField] = useState("");

  const [priceEdit, setEditPrice] = useState(false);

  const [priceEdited, setPriceEdited] = useState("");
  const handleClose = () => setEditPrice(false);

  const [priceEditTo, setpriceEditTo] = useState({});

  const columns = useMemo(
    () => [
      {
        label: "Id",
        accessor: "id",
        id: "id",
        cell: (info) => info.getValue(),
      },
      { label: "Name", accessor: "name", sort: true, id: "name" },
      { label: "Image", accessor: "image", id: "image" },
      { label: "Category", accessor: "category", id: "category" },
      { label: "Label", accessor: "label", id: "label" },
      {
        label: "Price",
        accessor: "price",
        sort: true,
        edit: true,
        id: "price",
      },
      { label: "Description", accessor: "description", id: "description" },
    ],
    []
  );

  useEffect(() => {
    // first fetch the data and create the ui

    const dataFetch = async () => {
      //

      const clickEditButtonClicked =
        window.sessionStorage.getItem("clickEditButton");
      const clickResetButtonClicked = window.sessionStorage.getItem(
        "clickResetButtonClicked"
      );

      if (clickEditButtonClicked === null && clickResetButtonClicked === null) {
        const requestOptions = {
          method: "GET",
          redirect: "follow",
        };

        const foodApi = await fetch(
          "https://s3-ap-southeast-1.amazonaws.com/he-public-data/reciped9d7b8c.json",
          requestOptions
        );

        const foodApiResult = await foodApi.json();

        setData(foodApiResult);

        window.sessionStorage.setItem(
          "defaultValue",
          JSON.stringify(foodApiResult)
        );
      } else if (JSON.parse(clickEditButtonClicked) === true) {
        // get the value from the edited

        const defaultValue = window.sessionStorage.getItem("editedvalue");

        setData(JSON.parse(defaultValue));
      } else if (JSON.parse(clickResetButtonClicked) === true) {
        // extract the default value
        const defaultValue = window.sessionStorage.getItem("defaultValue");

        setData(JSON.parse(defaultValue));
      }
    };

    dataFetch()
      .then()
      .catch((er) => console.error(er));
    // check the session storage
    // submit button clicked or not
    // if submit button clicked then
  }, []);
  const handleSorting = (sortField, sortOrder) => {
    if (sortField) {
      const sorted = [...data].sort((a, b) => {
        return (
          a[sortField].toString().localeCompare(b[sortField].toString(), "en", {
            numeric: true,
          }) * (sortOrder === "asc" ? 1 : -1)
        );
      });
      setData(sorted);
    }
  };

  const handleColumn = (columnName) => {
    // sort based on the cloumnName

    const sortOrder =
      columnName === sortField && order === "asc" ? "desc" : "asc";

    setSortField(columnName);
    setOrder(sortOrder);
    handleSorting(columnName, sortOrder);
    //
  };

  const handlePriceEdit = (editDetail) => {
    setpriceEditTo(editDetail);
    setPriceEdited(editDetail.price);
    setEditPrice(true);
  };

  const handleSaveButton = (e) => {
    e.preventDefault();
    const findDataTobeEdited = data.findIndex(
      (val) => val.id === priceEditTo.id
    );

    priceEditTo.price = priceEdited;
    data[findDataTobeEdited] = priceEditTo;

    setData(data);
    setEditPrice(false);

    window.sessionStorage.setItem("clickEditButton", true);
    window.sessionStorage.setItem("editedvalue", JSON.stringify(data));
  };

  const handleReset = (e) => {
    e.preventDefault();
    // update the value

    window.sessionStorage.setItem("clickEditButton", true);

    const defaultValue = window.sessionStorage.getItem("defaultValue");

    setData(JSON.parse(defaultValue));
  };
  return (
    <>
      <div className="">
        <table>
          <thead>
            <tr>
              {columns.map((clName) => {
                const { label, accessor, sort } = clName;

                const cl = sort
                  ? sort === accessor && order === "asc"
                    ? "up"
                    : sort === accessor && order === "desc"
                    ? "down"
                    : "default"
                  : "";
                return (
                  <th
                    className={cl}
                    onClick={sort ? () => handleColumn(accessor) : null}
                  >
                    {label}
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {data.map((detail) => {
              return (
                <tr key={detail.id}>
                  {columns.map(({ accessor, edit }) => {
                    const tData = detail[accessor] ? detail[accessor] : "——";

                    return (
                      <td
                        key={accessor}
                        onClick={edit ? () => handlePriceEdit(detail) : null}
                      >
                        {tData}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>

        <div
          style={{
            display: "flex",
            margin: "20px auto",
            justifyContent: "center",
          }}
        >
          <Button onClick={handleReset} variant="contained">
            Reset
          </Button>
        </div>
        <Modal
          open={priceEdit}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Change the price
            </Typography>
            <TextField
              id="outlined-basic"
              label="Price"
              variant="outlined"
              type="text"
              onChange={(e) => setPriceEdited(e.target.value)}
              style={{ width: "90%", marginLeft: "0%" }}
            />
            <br />
            <br />

            <div style={{ float: "right", marginRight: "5%" }}>
              <Button
                variant="contained"
                onClick={handleSaveButton}
                style={{ width: "100px" }}
              >
                Save
              </Button>
            </div>
          </Box>
        </Modal>
      </div>
    </>
  );
}
