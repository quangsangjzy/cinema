import { makeStyles } from "@material-ui/core";
import { underLineDashed, customScrollbar } from "../../../styles/materialUi";

const useStyles = makeStyles({
  payMent: (props) => ({
    width: "100%",
    height: props.isMobile ? "calc(100vh - 130px)" : "100vh",
    position: "relative",
    boxShadow: "0 0 15px rgb(0 0 0 / 30%)",
    padding: "0 8%",
    overflow: "auto",
    color: "white",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",

    WebkitUserSelect: "none",
    MozUserSelect: "none",
    msUserSelect: "none",
    userSelect: "none",
    ...customScrollbar,
  }),

  payMentItem: {
    position: "relative",
    padding: "12px 0",
    ...underLineDashed,
  },

  amount: {
    lineHeight: "60px",
    textAlign: "center",
    fontSize: "41px",
    color: "#44c020",
    fontWeight: 500,
  },

  tenPhim: {
    fontWeight: 500,
    textTransform: "capitalize",
  },

  seatInfo: {
    display: "flex",
    justifyContent: "space-between",
    gap: "10%",
    color: "rgb(238, 130, 59)",
    fontSize: 18,
  },

  amountLittle: {
    flex: "0 0 82px",
    color: "#44c020",
    fontWeight: 500,
    textAlign: "right",
  },

  label: {
    color: "#9b9b9b",
    display: "block",
  },

  labelEmail: {
    color: (props) => (props.dataFocus.email ? "#4a90e2" : "#9b9b9b"),
    fontSize: (props) =>
      !props.dataFocus.email && !props.dataSubmit.values.email ? 16 : 13,
    transition: "color .3s, font-size .2s",
    display: "block",
    position: "absolute",
    top: "9%",
    left: 0,
  },

  labelPhone: {
    color: (props) => (props.dataFocus.phone ? "#4a90e2" : "#9b9b9b"),
    fontSize: (props) =>
      !props.dataFocus.phone && !props.dataSubmit.values.phone ? 16 : 13,
    transition: "color .3s, font-size .2s",
    display: "block",
    position: "absolute",
    top: "9%",
    left: 0,
  },

  error: {
    color: "rgb(238, 130, 59)",
  },

  fillIn: {
    background: "black",
    color: "white",
    border: "none",
    width: "100%",
    lineHeight: 1.7,
    "&:focus": { outline: "none" },
  },

  fillInEmail: {
    background: "black",
    color: "white",
    border: "none",
    width: "100%",
    lineHeight: 1.7,
    paddingTop: (props) =>
      !props.dataFocus.email && !props.dataSubmit.values.email ? 0 : 12.5,
    marginTop: (props) =>
      !props.dataFocus.email && !props.dataSubmit.values.email ? 0 : 5,
    transition: ".2s",
    "&:focus": { outline: "none" },
  },

  fillInPhone: {
    background: "black",
    color: "white",
    border: "none",
    width: "100%",
    lineHeight: 1.7,
    paddingTop: (props) =>
      !props.dataFocus.phone && !props.dataSubmit.values.phone ? 0 : 12.5,
    marginTop: (props) =>
      !props.dataFocus.phone && !props.dataSubmit.values.phone ? 0 : 5,
    transition: ".2s",
    "&:focus": { outline: "none" },
  },

  btnDiscount: {
    backgroundColor: "#afafaf",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    padding: "5px 7px",
    position: "absolute",
    top: "50%",
    right: "0%",
    transform: "translateY(-50%)",
  },

  selectedPayMentMethod: {
    paddingTop: 12,
  },

  toggleNotice: (props) => ({
    display: props.isSelectedSeat ? "none" : "block",
    fontSize: 15,
    color: "#fb4f35",
    paddingTop: 12,
  }),

  formPayment: (props) => ({
    display: props.isSelectedSeat ? "block" : "none",
    paddingTop: 12,
  }),

  formPaymentItem: {
    display: "flex",
    alignItems: "center",
  },

  img: {
    borderRadius: "5px",
    marginLeft: "15px",
    marginRight: "15px",
    maxWidth: "40px",
  },

  input: {
    flexShrink: 0,
    width: "22px",
    height: "22px",
    cursor: "pointer",
    "-webkit-appearance": "none",
    border: "1px solid #4a90e2",
    borderRadius: "50%",
    outline: 0,
    "&:before": {
      content: "''",
      display: "block",
      width: "50%",
      height: "50%",
      margin: "25% auto",
      borderRadius: "50%",
    },
    "&:checked:before": {
      background: "#4a90e2",
    },
  },

  btnDV: {
    fontSize: "16px",
    borderRadius: "4px",
    background: "0 0",
    padding: "11px 25px",
    transition: "all .2s",
    marginTop: "25px",
    width: "100%",
    marginBottom: "20px",
    backgroundColor: "rgb(238, 130, 59)",
    border: "none",
    color: "#fff",
    fontWeight: "600",
    "&:hover": { backgroundColor: "#b42a14" },
  },

  bottomSection: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "100%",
  },

  notice: {
    fontSize: 13,
    textAlign: "center",
    paddingBottom: 70,
    paddingTop: 20,
  },

  imgNotice: {
    width: 16,
    height: 16,
    marginRight: 8,
  },

  contactColor: {
    color: "#f79320",
  },

  btnDatVe: (props) => ({
    position: "fixed",
    bottom: 0,
    right: 0,
    width: "25%",
    border: "none",
    cursor: "pointer",
    height: 60,
    backgroundColor: "#afafaf",
    backgroundImage: props.isReadyPayment
      ? "linear-gradient(223deg,#b4ec51 0,#429321 100%)"
      : "none",
  }),

  txtDatVe: {
    margin: "auto",
    color: "#e9e9e9",
    fontSize: 25,
  },

  // ===== DEMO PAYMENT UI =====
  demoOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.65)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    padding: 16,
  },

  demoModal: {
    width: "min(820px, 96vw)",
    background: "#0b1220",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 14,
    boxShadow: "0 18px 70px rgba(0,0,0,0.6)",
    color: "#fff",
    overflow: "hidden",
  },

  demoHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 16px",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
  },

  demoTitle: {
    fontSize: 18,
    fontWeight: 800,
  },

  demoClose: {
    width: 34,
    height: 34,
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(255,255,255,0.06)",
    color: "#fff",
    fontSize: 18,
    cursor: "pointer",
  },

  demoBody: {
    display: "grid",
    gridTemplateColumns: "260px 1fr",
    gap: 16,
    padding: 16,
  },

  // ✅ khung QR thật (trắng nền để QR rõ)
  demoQR: {
    width: "100%",
    maxWidth: 240,
    height: 240,
    borderRadius: 14,
    background: "#fff",
    border: "1px dashed rgba(255,255,255,0.18)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto",
  },

  demoHint: {
    marginTop: 10,
    fontSize: 13,
    opacity: 0.75,
    textAlign: "center",
  },

  demoRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    padding: "8px 0",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  },

  demoActions: {
    display: "flex",
    gap: 10,
    marginTop: 14,
  },

  demoNote: {
    marginTop: 10,
    fontSize: 12,
    opacity: 0.7,
  },

  demoError: {
    marginTop: 10,
    color: "rgb(238, 130, 59)",
    fontWeight: 600,
  },

  "@media (max-width: 720px)": {
    demoBody: {
      gridTemplateColumns: "1fr",
    },
  },
});

export default useStyles;