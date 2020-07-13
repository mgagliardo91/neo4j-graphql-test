import pgp from "pg-promise";

const initOptions = {
    query(e) {
        console.log(e.query);
    }
};

export default pgp(initOptions) (
    process.env.POSTGRES_URL || 'postgresql://user:pass@localhost:5105/db'
)
