db = db.getSiblingDB("admin");
db.createUser({
    user: "admin",
    pwd: "mongoadmin",
    roles: [{ role: "root", db: "admin" }]
});

db = db.getSiblingDB("rin");
db.createUser({
    user: "rin",
    pwd: "rin",
    roles: [
        { role: "dbOwner", db: "rin" },
        { role: "dbAdmin", db: "rin" },
        { role: "readWrite", db: "rin" }
    ]
});