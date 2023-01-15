import { FC } from "react";
import { Layout } from "../components/Layout";

export const IndexPage: FC = () => {
	return (
		<Layout>
			<div>Hello main (new update!)</div>
      <iframe src="https://www.google.com"> </iframe>
		</Layout>
	);
};
