// Isometric board layouts for the FDE field manual.
// Coordinates live in a 900 x 460 SVG viewBox. A "node" is a beveled tile;
// an "edge" is an animated request / response / handshake path.
const n = (id, x, y, en, vi, tone, badge) => ({
  id, x, y, tone, badge, label: { en, vi },
});
const e = (id, from, to, kind, en, vi) => ({
  id, from, to, kind, label: { en, vi },
});

export const DIAGRAMS = {
  delta: {
    nodes: [
      n("hq", 170, 150, "CORE PRODUCT", "SẢN PHẨM LÕI", "tan", "HQ"),
      n("fde", 450, 150, "THE DELTA", "KHOẢNG CÁCH", "green", "FDE"),
      n("client", 730, 150, "CLIENT REALITY", "THỰC TẾ KHÁCH", "orange", "CLI"),
      n("mission", 450, 330, "MISSION VALUE", "GIÁ TRỊ SỨ MỆNH", "purple", "WIN"),
    ],
    edges: [
      e("d1", "hq", "fde", "request", "features", "tính năng"),
      e("d2", "fde", "client", "request", "glue code", "mã ghép nối"),
      e("d3", "client", "fde", "response", "messy data", "dữ liệu lộn xộn"),
      e("d4", "fde", "mission", "handshake", "speed to value", "tốc độ tạo giá trị"),
      e("d5", "mission", "hq", "response", "productized", "sản phẩm hóa"),
    ],
  },
  data: {
    nodes: [
      n("source", 150, 140, "LEGACY SQL", "SQL CŨ", "orange", "SQL"),
      n("bronze", 420, 140, "BRONZE / RAW", "BRONZE / THÔ", "tan", "RAW"),
      n("silver", 690, 140, "SILVER / CLEAN", "SILVER / SẠCH", "blue", "CLR"),
      n("quality", 150, 320, "CIRCUIT BREAKER", "CẦU CHÌ DỮ LIỆU", "pink", "DQ"),
      n("gold", 420, 320, "GOLD / BUSINESS", "GOLD / KINH DOANH", "green", "AGG"),
      n("bi", 690, 320, "DASHBOARD", "DASHBOARD", "purple", "BI"),
    ],
    edges: [
      e("a1", "source", "bronze", "request", "ingest", "nạp dữ liệu"),
      e("a2", "bronze", "silver", "request", "clean + join", "làm sạch + join"),
      e("a3", "silver", "gold", "request", "aggregate", "tổng hợp"),
      e("a4", "gold", "bi", "response", "serve", "phục vụ"),
      e("a5", "quality", "silver", "handshake", "validate", "kiểm chứng"),
      e("a6", "quality", "gold", "handshake", "alert", "cảnh báo"),
      e("a7", "bi", "quality", "response", "feedback", "phản hồi"),
    ],
  },
  cloud: {
    nodes: [
      n("onprem", 150, 140, "ON-PREM DC", "DC TẠI CHỖ", "orange", "DC"),
      n("vpc", 420, 140, "LANDING ZONE", "VÙNG HẠ CÁNH", "green", "VPC"),
      n("gke", 690, 140, "PRIVATE GKE", "GKE RIÊNG", "blue", "K8S"),
      n("iam", 150, 320, "IAM / VPC SC", "IAM / VPC SC", "purple", "SEC"),
      n("bq", 420, 320, "BIGQUERY", "BIGQUERY", "tan", "BQ"),
      n("tf", 690, 320, "TERRAFORM", "TERRAFORM", "pink", "IAC"),
    ],
    edges: [
      e("c1", "onprem", "vpc", "request", "interconnect", "kết nối riêng"),
      e("c2", "vpc", "gke", "request", "private ingress", "vào riêng tư"),
      e("c3", "gke", "bq", "request", "query", "truy vấn"),
      e("c4", "tf", "vpc", "handshake", "provision", "cấp phát"),
      e("c5", "tf", "gke", "handshake", "deploy", "triển khai"),
      e("c6", "iam", "vpc", "handshake", "perimeter", "vành đai"),
      e("c7", "iam", "bq", "handshake", "least privilege", "ít đặc quyền"),
      e("c8", "bq", "onprem", "response", "insight", "insight"),
    ],
  },
  agent: {
    nodes: [
      n("user", 140, 130, "ANALYST", "NHÂN VIÊN", "orange", "USR"),
      n("runtime", 420, 130, "AGENT RUNTIME", "RUNTIME AGENT", "blue", "RUN"),
      n("adk", 700, 130, "ADK ORCHESTRATOR", "ADK ĐIỀU PHỐI", "green", "ADK"),
      n("planner", 140, 320, "PLANNER AGENT", "AGENT LÊN KẾ HOẠCH", "purple", "PLN"),
      n("coder", 380, 320, "SQL CODER", "AGENT SQL", "tan", "SQL"),
      n("evals", 620, 320, "EVALS + TRACE", "ĐÁNH GIÁ + TRACE", "pink", "EVL"),
      n("rag", 840, 320, "GROUNDING / RAG", "GROUNDING / RAG", "teal", "RAG"),
    ],
    edges: [
      e("g1", "user", "runtime", "request", "question", "câu hỏi"),
      e("g2", "runtime", "adk", "request", "invoke", "gọi agent"),
      e("g3", "adk", "planner", "handshake", "delegate", "ủy thác"),
      e("g4", "planner", "coder", "request", "subtask", "việc con"),
      e("g5", "coder", "evals", "request", "tool trace", "vết công cụ"),
      e("g6", "evals", "adk", "response", "score", "điểm"),
      e("g7", "adk", "rag", "request", "retrieve", "truy xuất"),
      e("g8", "rag", "adk", "response", "context", "ngữ cảnh"),
      e("g9", "adk", "user", "response", "answer", "câu trả lời"),
    ],
  },
  edge: {
    nodes: [
      n("media", 140, 130, "SIGNED MEDIA", "ĐĨA KÝ SỐ", "tan", "ISO"),
      n("mirror", 400, 130, "OFFLINE MIRROR", "MIRROR NGOẠI TUYẾN", "blue", "PYP"),
      n("registry", 660, 130, "HARDENED REGISTRY", "REGISTRY CỨNG HÓA", "purple", "IMG"),
      n("diode", 140, 320, "DATA DIODE", "DIODE DỮ LIỆU", "pink", "1W"),
      n("k3s", 380, 320, "K3s EDGE", "K3s BIÊN", "green", "K3S"),
      n("model", 620, 320, "LOCAL INFERENCE", "SUY LUẬN CỤC BỘ", "orange", "LLM"),
      n("telemetry", 840, 320, "STORE & FORWARD", "LƯU & CHUYỂN", "teal", "LOG"),
    ],
    edges: [
      e("x1", "media", "mirror", "request", "sha-256 verify", "kiểm tra sha-256"),
      e("x2", "mirror", "registry", "request", "signed images", "image đã ký"),
      e("x3", "registry", "k3s", "request", "admission", "nạp vào cụm"),
      e("x4", "k3s", "model", "request", "serve weights", "nạp trọng số"),
      e("x5", "model", "telemetry", "response", "buffer logs", "đệm log"),
      e("x6", "telemetry", "diode", "response", "redacted out", "đầu ra đã lọc"),
      e("x7", "diode", "k3s", "handshake", "manifest sync", "đồng bộ manifest"),
    ],
  },
  consult: {
    nodes: [
      n("ceo", 150, 140, "CEO / SPONSOR", "CEO / BẢO TRỢ", "purple", "CEO"),
      n("whys", 420, 140, "THREE WHYS", "BA CÂU TẠI SAO", "green", "WHY"),
      n("prd", 690, 140, "TECHNICAL PRD", "PRD KỸ THUẬT", "blue", "PRD"),
      n("champion", 150, 320, "CHAMPION", "NGƯỜI ỦNG HỘ", "orange", "CHM"),
      n("sow", 420, 320, "SOW / SCOPE", "SOW / PHẠM VI", "tan", "SOW"),
      n("day2", 690, 320, "DAY 2 OWNER", "CHỦ NHÂN DAY 2", "teal", "OPS"),
    ],
    edges: [
      e("s1", "ceo", "whys", "request", "vague ask", "yêu cầu mơ hồ"),
      e("s2", "whys", "prd", "request", "root pain", "nỗi đau gốc"),
      e("s3", "champion", "whys", "handshake", "context", "bối cảnh"),
      e("s4", "prd", "sow", "request", "measurable", "đo được"),
      e("s5", "sow", "day2", "handshake", "handover", "bàn giao"),
      e("s6", "day2", "ceo", "response", "BLUF update", "báo cáo BLUF"),
    ],
  },
  interview: {
    nodes: [
      n("brief", 150, 140, "CASE BRIEF", "ĐỀ BÀI", "tan", "CASE"),
      n("clarify", 420, 140, "CLARIFY", "LÀM RÕ", "green", "C"),
      n("architect", 690, 140, "ARCHITECT", "THIẾT KẾ", "blue", "A"),
      n("delta", 150, 320, "SOLVE THE DELTA", "GIẢI KHOẢNG CÁCH", "orange", "S"),
      n("evaluate", 420, 320, "EVALUATE", "ĐÁNH GIÁ", "purple", "E"),
      n("rubric", 690, 320, "SENIOR RUBRIC", "THANG ĐIỂM SENIOR", "teal", "R"),
    ],
    edges: [
      e("i1", "brief", "clarify", "request", "ask first", "hỏi trước"),
      e("i2", "clarify", "architect", "request", "constraints", "ràng buộc"),
      e("i3", "architect", "delta", "handshake", "glue work", "phần ghép nối"),
      e("i4", "delta", "evaluate", "request", "prove it", "chứng minh"),
      e("i5", "evaluate", "rubric", "response", "trade-offs", "đánh đổi"),
      e("i6", "rubric", "brief", "response", "loop back", "quay lại đề"),
    ],
  },
  artifacts: {
    nodes: [
      n("survey", 150, 140, "SITE SURVEY", "KHẢO SÁT HIỆN TRƯỜNG", "orange", "W1"),
      n("prd", 420, 140, "SCOPING / PRD", "PRD / PHẠM VI", "blue", "PRD"),
      n("wes", 690, 140, "WEEKLY WES", "BÁO CÁO TUẦN", "green", "WES"),
      n("adr", 150, 320, "DECISION / ADR", "QUYẾT ĐỊNH / ADR", "purple", "ADR"),
      n("sponsor", 420, 320, "EXEC SPONSOR", "BẢO TRỢ CẤP CAO", "tan", "EXE"),
      n("value", 690, 320, "VALUE PROOF", "MINH CHỨNG GIÁ TRỊ", "teal", "VAL"),
    ],
    edges: [
      e("t1", "survey", "prd", "request", "ground truth", "sự thật hiện trường"),
      e("t2", "prd", "wes", "request", "evals", "bộ đánh giá"),
      e("t3", "sponsor", "wes", "handshake", "status", "trạng thái"),
      e("t4", "adr", "prd", "handshake", "why", "lý do"),
      e("t5", "wes", "value", "response", "metric move", "dịch chuyển số liệu"),
      e("t6", "value", "sponsor", "response", "renewal", "gia hạn"),
    ],
  },
  stack: {
    nodes: [
      n("python", 150, 140, "PYTHON / AI", "PYTHON / AI", "blue", "PY"),
      n("sql", 420, 140, "SQL + DUCKDB", "SQL + DUCKDB", "green", "SQL"),
      n("dbt", 690, 140, "DBT / SPARK", "DBT / SPARK", "tan", "ETL"),
      n("iac", 150, 320, "TERRAFORM / HELM", "TERRAFORM / HELM", "purple", "IAC"),
      n("gcp", 420, 320, "GCP / GKE", "GCP / GKE", "orange", "GCP"),
      n("observe", 690, 320, "PROM + GRAFANA", "PROM + GRAFANA", "teal", "OBS"),
    ],
    edges: [
      e("k1", "python", "sql", "request", "prototype", "thử nghiệm"),
      e("k2", "sql", "dbt", "request", "transform", "biến đổi"),
      e("k3", "dbt", "gcp", "request", "ship", "triển khai"),
      e("k4", "iac", "gcp", "handshake", "provision", "cấp phát"),
      e("k5", "gcp", "observe", "response", "signals", "tín hiệu"),
      e("k6", "observe", "python", "response", "debug loop", "vòng gỡ lỗi"),
    ],
  },
  library: {
    nodes: [
      n("canon", 150, 140, "CORE BOOKS", "SÁCH NỀN TẢNG", "tan", "BOOK"),
      n("papers", 420, 140, "WHITEPAPERS", "BÀI NGHIÊN CỨU", "blue", "PDF"),
      n("podcasts", 690, 140, "PODCASTS", "PODCAST", "purple", "AUD"),
      n("glossary", 150, 320, "GLOSSARY", "BẢNG THUẬT NGỮ", "green", "TERM"),
      n("community", 420, 320, "CONTRIBUTING", "ĐÓNG GÓP", "orange", "PR"),
      n("you", 690, 320, "YOU / FDE", "BẠN / FDE", "teal", "YOU"),
    ],
    edges: [
      e("l1", "canon", "you", "request", "fundamentals", "nền tảng"),
      e("l2", "papers", "you", "request", "ancestry", "gốc rễ"),
      e("l3", "podcasts", "you", "request", "signal", "tín hiệu"),
      e("l4", "glossary", "you", "handshake", "shared language", "ngôn ngữ chung"),
      e("l5", "community", "you", "handshake", "curate", "tuyển chọn"),
      e("l6", "you", "community", "response", "give back", "đóng góp lại"),
    ],
  },
};

export const EDGE_COLORS = {
  request: "#dfa77f",
  response: "#93b785",
  handshake: "#a390b2",
};

export const EDGE_NAMES = {
  request: { en: "request", vi: "yêu cầu" },
  response: { en: "response", vi: "phản hồi" },
  handshake: { en: "handshake", vi: "bắt tay" },
};
