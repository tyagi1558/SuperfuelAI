import { Form, useLoaderData, useActionData } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "../../components/ui/card";
import { getsnippetsById, RunCodeSnippetById } from "../../database/snippets";

export async function loader({ params }) {
  const snippet = await getsnippetsById(params.id);
  return { snippet };
}

export async function action({ request, params }) {
  const formData = await request.formData();

  // Run the code and return the result to make it available via useActionData
  const result = await RunCodeSnippetById(params.id);
  return result;
}

export default function EditUser() {
  const { snippet } = useLoaderData();
  // This will contain the execution result after form submission
  const executionResult = useActionData();

  return (
    <div className="max-w-md mx-auto mt-10">
      <Card>
        <CardHeader>
          <CardTitle>Run Code</CardTitle>
        </CardHeader>
        <CardContent>
          <Form method="post" className="space-y-4">
            <Input name="name" defaultValue={snippet.name} />
            {/* <Input name="email" defaultValue={snippet.code} /> */}
            <textarea
              defaultValue={snippet.code}
              placeholder="Write your code here..."
              required
              rows={10}
              className="w-full p-2 font-mono text-sm border rounded-md bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />

            <Button className="w-full" type="submit">
              Run Code
            </Button>
          </Form>
        </CardContent>

        {executionResult && (
          <CardFooter className="flex flex-col items-start border-t pt-6">
            <h3 className="font-medium text-lg mb-2">Execution Result:</h3>

            {/* Console Logs */}
            {executionResult.logs && executionResult.logs.length > 0 && (
              <div className="w-full mb-4">
                <h4 className="font-medium text-sm mb-1">Console Output:</h4>
                <div className="bg-gray-100 p-3 rounded-md font-mono text-sm w-full">
                  {executionResult.logs.map((log, index) => (
                    <div key={index}>{log}</div>
                  ))}
                </div>
              </div>
            )}

            {executionResult.error && (
              <div className="w-full mt-4">
                <h4 className="font-medium text-sm mb-1 text-red-600">
                  Error:
                </h4>
                <div className="bg-red-50 text-red-700 p-3 rounded-md font-mono text-sm w-full">
                  {executionResult.error}
                </div>
              </div>
            )}
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
