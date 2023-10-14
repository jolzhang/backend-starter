type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
type InputTag = "input" | "textarea";
type Field = InputTag | { [key: string]: Field };
type Fields = Record<string, Field>;

type operation = {
  name: string;
  endpoint: string;
  method: HttpMethod;
  fields: Fields;
};

const operations: operation[] = [
  {
    name: "Get Session User (logged in user)",
    endpoint: "/api/session",
    method: "GET",
    fields: {},
  },
  {
    name: "Create User",
    endpoint: "/api/users",
    method: "POST",
    fields: { username: "input", password: "input", email: "input" },
  },
  {
    name: "Login",
    endpoint: "/api/login",
    method: "POST",
    fields: { username: "input", password: "input" },
  },
  {
    name: "Logout",
    endpoint: "/api/logout",
    method: "POST",
    fields: {},
  },
  {
    name: "Update User",
    endpoint: "/api/users",
    method: "PATCH",
    fields: { update: { username: "input", password: "input" } },
  },
  {
    name: "Delete User",
    endpoint: "/api/users",
    method: "DELETE",
    fields: {},
  },
  {
    name: "Get Users (empty for all)",
    endpoint: "/api/users/:username",
    method: "GET",
    fields: { username: "input" },
  },
  // {
  //   name: "Get Posts (empty for all)",
  //   endpoint: "/api/posts",
  //   method: "GET",
  //   fields: { author: "input" },
  // },
  // {
  //   name: "Create Post",
  //   endpoint: "/api/posts",
  //   method: "POST",
  //   fields: { content: "input" },
  // },
  // {
  //   name: "Update Post",
  //   endpoint: "/api/posts/:id",
  //   method: "PATCH",
  //   fields: { id: "input", update: { content: "input", options: { backgroundColor: "input" } } },
  // },
  // {
  //   name: "Delete Post",
  //   endpoint: "/api/posts/:id",
  //   method: "DELETE",
  //   fields: { id: "input" },
  // },

  {
    name: "Create New Group",
    endpoint: "/api/group",
    method: "POST",
    fields: { groupname: "input" },
  },
  {
    name: "Get Group ID",
    endpoint: "/api/group/:name",
    method: "GET",
    fields: { name: "input" },
  },
  {
    name: "Join a Group",
    endpoint: "/api/group/join/:name",
    method: "PATCH",
    fields: { name: "input" },
  },
  {
    name: "Leave a Group",
    endpoint: "/api/group/leave/:name",
    method: "PATCH",
    fields: { name: "input" },
  },
  {
    name: "Remove a User from a Group",
    endpoint: "/api/group/name/:name/otheruser/:otheruse",
    method: "PATCH",
    fields: { name: "input", otheruser_ID: "input" },
  },
  {
    name: "Remove a Group",
    endpoint: "/api/group/:name",
    method: "DELETE",
    fields: { name: "input" },
  },
  {
    name: "Change Admin Control",
    endpoint: "/api/group/name/:name/user/:_newUser",
    method: "PATCH",
    fields: { id: "input", newuser: "input" }
  },
  {
    name: "Change Group Name",
    endpoint: "/api/group/name/:_name/newname/:_newname",
    method: "PATCH",
    fields: { id: "input", newname: "input"}
  },
  {
    name: "Get All Groups",
    endpoint: "/api/groups",
    method: "GET",
    fields: {},
  },
  {
    name: "Get User Groups",
    endpoint: "/api/group/",
    method: "GET",
    fields: {},
  },
  {
    name: "Create Comment",
    endpoint: "/api/comment/",
    method: "POST",
    fields: { comment: "input", group: "input"},
  },
  {
    name: "Remove Comment",
    endpoint: "/api/comment/:id",
    method: "DELETE",
    fields: { id: "input"},
  },
  {
    name: "Create Nested Comment",
    endpoint: "/api/comment/parent/:_parent",
    method: "POST",
    fields: { content: "input", group: "input", parent: "input"},
  },
  {
    name: "Get All Comments from Group",
    endpoint: "/api/comment/group/:_group",
    method: "GET",
    fields: { group: "input" }
  },
  {
    name: "Input New Book",
    endpoint: "/api/book",
    method: "POST",
    fields: { title: "input", author: "input", summary: "input", review: "input"}
  },
  {
    name: "Get All Books",
    endpoint: "/api/book",
    method: "GET",
    fields: {}
  },
  {
    name: "Add Group to Book!",
    endpoint: "/api/book/add/:title/group/:chat",
    method: "PATCH",
    fields: { title: "input", chat: "input" },
  },
  {
    name: "Remove Group from Book!",
    endpoint: "/api/book/remove/:title/group/:chat",
    method: "PATCH",
    fields: { title: "input", chat: "input" },
  },
  {
    name: "Search Up Book",
    endpoint: "/api/book/title/:title",
    method: "GET",
    fields: { title: "input" },
  },
  {
    name: "Get Book Recommendations",
    endpoint: "/api/book/recommend/",
    method: "GET",
    fields: {},
  },
  {
    name: "Create new Reading List",
    endpoint: "/api/list",
    method: "POST",
    fields: { name: "input" }
  },
  {
    name: "Add Book to Reading List",
    endpoint: "/api/list/add/:book/",
    method: "PATCH",
    fields: { name: "input", book: "input" }
  },
  {
    name: "Remove Book from Reading List",
    endpoint: "/api/list/remove/:book",
    method: "PATCH",
    fields: { name: "input", book: "input" },
  },
  {
    name: "Delete List",
    endpoint: "/api/list",
    method: "DELETE",
    fields: { name: "input" },
  },
  {
    name: "Get User Lists",
    endpoint: "/api/list",
    method: "GET",
    fields: { },
  }
];

// Do not edit below here.
// If you are interested in how this works, feel free to ask on forum!

function updateResponse(code: string, response: string) {
  document.querySelector("#status-code")!.innerHTML = code;
  document.querySelector("#response-text")!.innerHTML = response;
}

async function request(method: HttpMethod, endpoint: string, params?: unknown) {
  try {
    if (method === "GET" && params) {
      endpoint += "?" + new URLSearchParams(params as Record<string, string>).toString();
      params = undefined;
    }

    const res = fetch(endpoint, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "same-origin",
      body: params ? JSON.stringify(params) : undefined,
    });

    return {
      $statusCode: (await res).status,
      $response: await (await res).json(),
    };
  } catch (e) {
    console.log(e);
    return {
      $statusCode: "???",
      $response: { error: "Something went wrong, check your console log.", details: e },
    };
  }
}

function fieldsToHtml(fields: Record<string, Field>, indent = 0, prefix = ""): string {
  return Object.entries(fields)
    .map(([name, tag]) => {
      return `
        <div class="field" style="margin-left: ${indent}px">
          <label>${name}:
          ${typeof tag === "string" ? `<${tag} name="${prefix}${name}"></${tag}>` : fieldsToHtml(tag, indent + 10, prefix + name + ".")}
          </label>
        </div>`;
    })
    .join("");
}

function getHtmlOperations() {
  return operations.map((operation) => {
    return `<li class="operation">
      <h3>${operation.name}</h3>
      <form class="operation-form">
        <input type="hidden" name="$endpoint" value="${operation.endpoint}" />
        <input type="hidden" name="$method" value="${operation.method}" />
        ${fieldsToHtml(operation.fields)}
        <button type="submit">Submit</button>
      </form>
    </li>`;
  });
}

function prefixedRecordIntoObject(record: Record<string, string>) {
  const obj: any = {}; // eslint-disable-line
  for (const [key, value] of Object.entries(record)) {
    if (!value) {
      continue;
    }
    const keys = key.split(".");
    const lastKey = keys.pop()!;
    let currentObj = obj;
    for (const key of keys) {
      if (!currentObj[key]) {
        currentObj[key] = {};
      }
      currentObj = currentObj[key];
    }
    currentObj[lastKey] = value;
  }
  return obj;
}

async function submitEventHandler(e: Event) {
  e.preventDefault();
  const form = e.target as HTMLFormElement;
  const { $method, $endpoint, ...reqData } = Object.fromEntries(new FormData(form));

  // Replace :param with the actual value.
  const endpoint = ($endpoint as string).replace(/:(\w+)/g, (_, key) => {
    const param = reqData[key] as string;
    delete reqData[key];
    return param;
  });

  const data = prefixedRecordIntoObject(reqData as Record<string, string>);

  updateResponse("", "Loading...");
  const response = await request($method as HttpMethod, endpoint as string, Object.keys(data).length > 0 ? data : undefined);
  updateResponse(response.$statusCode.toString(), JSON.stringify(response.$response, null, 2));
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelector("#operations-list")!.innerHTML = getHtmlOperations().join("");
  document.querySelectorAll(".operation-form").forEach((form) => form.addEventListener("submit", submitEventHandler));
});
