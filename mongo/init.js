db.createUser({
    user: 'rin',
    pwd: 'rindb',
    roles: [
        {
            role: 'readWrite',
            db: 'rin',
        },
    ],
})