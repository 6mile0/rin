// モジュールをロード
const mongoose = require("mongoose");

// データベース接続
mongoose.connect(
    "mongodb://mongo/test",  // testというDBに接続しています
    {
        useUnifiedTopology: true,
        useNewUrlParser: true
    }
);

const db = mongoose.connection;
db.once("opne", () => {
    // 接続できると以下のログが出力されます。
    // 接続できない場合はエラーが出力されます。
    console.log("Success MongoDB connected!!");
});