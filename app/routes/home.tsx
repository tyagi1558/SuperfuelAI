import { Link, useLoaderData } from "react-router-dom";
import { getsnippets } from "../../database/snippets";
import { Button } from "../../components/ui/button";

import { Card, CardContent } from "../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";

export async function loader() {
  const snippets = await getsnippets();
  return { snippets };
}

export default function Home() {
  const { snippets } = useLoaderData();

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Snippet</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {snippets.map((Snippet) => (
                <TableRow key={Snippet.id}>
                  <TableCell>{Snippet.name}</TableCell>
                  <TableCell>{Snippet.code}</TableCell>
                  <TableCell>
                    <Link to={`/run/${Snippet.id}`}>
                      <Button variant="outline">Run Code</Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
