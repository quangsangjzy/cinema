import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles({
  footer: {
    backgroundColor: "#0b0b0b",
    color: "#fff",
    fontFamily: "'Roboto', sans-serif",
    paddingTop: 40,
    paddingBottom: 20,
  },

  footerTop: {
    display: "flex",
    justifyContent: "space-around",
    flexWrap: "wrap",
    borderBottom: "1px solid #222",
    paddingBottom: 30,
  },

  footerColumn: {
    width: "30%",
    minWidth: 280,
    marginBottom: 20,
    "& h4": {
      fontWeight: "700",
      fontSize: 16,
      marginBottom: 10,
    },
    "& ul": {
      listStyle: "none",
      paddingLeft: 0,
      lineHeight: 2,
      color: "#ddd",
    },
    "& li:hover": {
      color: "#f26b38",
      cursor: "pointer",
    },
  },

  line: {
    width: 50,
    height: 4,
    backgroundColor: "#f26b38",
    borderRadius: 3,
    marginBottom: 10,
  },

  logoBHD: {
    width: 90,
    marginTop: 10,
  },

  logoVerify: {
    width: 200,
    marginTop: 10,
  },

  socialLabel: {
    fontWeight: 600,
    marginTop: 10,
  },

  socialIcons: {
    display: "flex",
    gap: 15,
    fontSize: 26,
    marginTop: 5,
    "& svg": {
      cursor: "pointer",
      color: "#fff",
      transition: "0.3s",
      "&:hover": {
        color: "#f26b38",
      },
    },
  },

  footerBottom: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    paddingTop: 20,
    textAlign: "center",
    color: "#ccc",
    fontSize: 13,
    gap: 15,
  },

  logoBottom: {
    width: 70,
    height: "auto",
  },

  companyInfo: {
    maxWidth: 700,
    "& p": {
      margin: "4px 0",
    },
  },
  footerInner: {
    maxWidth: 1200,      // Giới hạn độ rộng
    margin: "0 auto",    // Căn giữa
    padding: "0 20px",   // Thêm khoảng cách 2 bên
  },
});

export default useStyles;
