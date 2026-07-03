const allowedOrigins = [
  "http://localhost:5173",
  "https://app.mycompany.com",
  "https://admin.mycompany.com",
];

const corsOptions = {
  origin: (origin, callback) => {
    // Postman, mobile apps, server-to-server requests
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },

  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],

  allowedHeaders: [
    "Content-Type",
    "Authorization",
  ],

  credentials: true,

  optionsSuccessStatus: 200,
};

module.exports = corsOptions;