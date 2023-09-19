import { Anchor, Button, Container, Group } from "@mantine/core";
import React, { ReactNode } from "react";
import { ROUTES } from "../constants/routes.constant";

interface IMainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<IMainLayoutProps> = ({ children }) => {
  return (
    <>
      <Container>
        <Group>
          <Anchor href={ROUTES.HOMEPAGE}>Homepage</Anchor>
          <Anchor href={ROUTES.CALCULATE}>Calculate</Anchor>
        </Group>
        {children}
      </Container>
    </>
  );
};
export default MainLayout;
