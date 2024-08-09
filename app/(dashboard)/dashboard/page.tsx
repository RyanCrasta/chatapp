import { FC } from "react";
import Button from "../../../components/ui/Button";
import styles from "./dashboard.module.css";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

interface pageProps {}

const page = async({}) => {

  const session = await getServerSession(authOptions)

  console.log("QQQQqqq");
  return (
    <div>
      <Button size="lg" className={styles["redButton"]}>
        Click me
      </Button>

      <pre>{JSON.stringify(session)}</pre>
    </div>
  );
};

export default page;
