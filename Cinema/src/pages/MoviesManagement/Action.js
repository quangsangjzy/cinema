import React from "react";

import EditIcon from "@material-ui/icons/Edit";
import IconButton from "@material-ui/core/IconButton";
import DeleteForeverIcon from "@material-ui/icons/DeleteForever";
import Tooltip from "@material-ui/core/Tooltip";

import UseApiCheckIsMaPhimSetShowtime from "../../utilities/useApiCheckIsMaPhimSetShowtime";

export default function Action({ onRequestDelete, phimItem, onEdit }) {
  const isMovieSetShowtime = UseApiCheckIsMaPhimSetShowtime(phimItem.maPhim);

  return (
    <>
      <Tooltip title={isMovieSetShowtime ? "Không thể xóa" : "Xóa"}>
        {/* Tooltip không nhận events trên button disabled => bọc span để tránh warning */}
        <span style={{ display: "inline-block" }}>
          <IconButton
            color="primary"
            disabled={isMovieSetShowtime}
            style={{ color: isMovieSetShowtime ? "#00000042" : "#f50057" }}
            onClick={() => {
              if (isMovieSetShowtime) return;
              onRequestDelete?.(phimItem);
            }}
          >
            <DeleteForeverIcon />
          </IconButton>
        </span>
      </Tooltip>

      <Tooltip title="Chỉnh sửa">
        <IconButton
          color="primary"
          style={{ color: "rgb(238, 130, 59)" }}
          onClick={() => onEdit(phimItem)}
        >
          <EditIcon />
        </IconButton>
      </Tooltip>
    </>
  );
}
