app.use(session({
    secret: 'ougzgrz54gze4gze8',
    resave: true,
    saveUninitialized: true
}));
app.use((req,res,next) => {
    res.locals.session = req.session;
    next();
});
