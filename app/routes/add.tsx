import { Form, redirect } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { createCodeSnippet } from "../../database/snippets";

export async function action({ request }) {
  const formData = await request.formData();
  const name = formData.get("name");
  const code = formData.get("code");
  await createCodeSnippet({ name, code });
  return redirect("/");
}

export default function createsnippet() {
  return (
    <div className="max-w-md mx-auto mt-10">
      <Card>
        <CardHeader>
          <CardTitle>Add New Code Template</CardTitle>
        </CardHeader>
        <CardContent>
          <Form method="post" className="space-y-4">
            <Input type="text" name="name" placeholder="Name" required />
            <textarea
              name="code"
              placeholder="Write your code here..."
              required
              rows={10}
              className="w-full p-2 font-mono text-sm border rounded-md bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />

            <Button className="w-full" type="submit">
              Add
            </Button>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
