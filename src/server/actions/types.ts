export type ActionError = {
  code: string;
  message: string;
  fieldErrors?: Record<string, string[]>;
};

export type ActionResult<TData> =
  | {
      ok: true;
      data: TData;
      message?: string;
    }
  | {
      ok: false;
      error: ActionError;
    };
