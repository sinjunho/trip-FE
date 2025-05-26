// src/api/services.js
import memberAPI from "./member";
import boardAPI from "./board";
import attractionAPI from "./attraction";
import planAPI from "./plan";
import authAPI from "./auth";
import adminAPI from "./admin";
import commentAPI from "./comment"; // 추가

export default {
  member: memberAPI,
  board: boardAPI,
  attraction: attractionAPI,
  plan: planAPI,
  auth: authAPI,
  admin: adminAPI,
  comment: commentAPI, // 추가
};
