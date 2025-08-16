"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useFieldArray, useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { SquarePen, Trash2 } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import axios from "axios";
import { useEffect, useState } from "react";
import { toast, Toaster } from "sonner";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogAction,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const FormSchema = z.object({
  question: z.string().min(5, {
    message: "Pertanyaan minimal mempunyai 5 huruf!",
  }),
  correctIndex: z.string().min(1, { message: "Pilih satu jawaban yang benar" }),
  answers: z
    .array(
      z.object({
        answer: z.string().min(2, {
          message: "Jawaban minimal mempunyai 2 huruf!",
        }),
      })
    )
    .min(2, "Minimal 2 jawaban")
    .max(5, "Maksimal 5 jawaban"),
  categories: z.string().min(1, { message: "Minimal berikan 1 kategori!" }),
  explanation_url: z.url(),
});

export default function Page() {
  // Add Data
  const [openDialog, setOpenDialog] = useState(false);
  const [buttonSaveDisable, setButtonSaveDisable] = useState(false);

  // Table Data
  const [questions, setQuestions] = useState([]);
  const [totalQuestion, setTotalQuestion] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 10;
  const [detQuestions, setDetQuestions] = useState({});

  // Edit
  const [openEdit, setOpenEdit] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    getAllQuestion(page);
  }, [page]);

  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      question: "",
      correctIndex: "",
      answers: [{ answer: "" }, { answer: "" }],
      categories: "",
      explanation_url: "https://google.com",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "answers",
  });

  async function onSubmit(data) {
    const TOKEN = sessionStorage.getItem("access_token");
    setButtonSaveDisable(true);

    const options = data.answers.map((ans, idx) => ({
      content: ans.answer,
      is_correct: String(idx) === data.correctIndex,
    }));

    const payload = {
      content: data.question,
      options,
      categories: data.categories.trim().split(", "),
      explanation_url: data.explanation_url,
    };

    try {
      const res = await axios.post(`${API_URL}/admin/questions`, payload, {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          "Content-Type": "application/json",
        },
      });

      if (res.status !== 200) {
        toast(res.data.message ?? res.data.error ?? "Error");
        setButtonSaveDisable(false);
        return;
      }

      toast("Pertanyaan baru berhasil ditambahkan! 🥳");
      setButtonSaveDisable(false);
      setOpenDialog(false);
      form.reset();
      setTimeout(() => {
        location.reload();
      }, 1000);
    } catch (err) {
      setButtonSaveDisable(false);
      console.log(err);
      toast(err.response.data.error ?? err.message ?? "Error tidak diketahui!");
    }
  }

  async function getAllQuestion(pagea) {
    const TOKEN = sessionStorage.getItem("access_token");

    try {
      const res = await axios.get(
        `${API_URL}/admin/questions?page=${pagea}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );
      const resData = res.data;
      console.log(resData.data.questions);

      if (res.status !== 200) {
        toast(res.data.message);
        return;
      }

      setTotalQuestion(resData.data.total_count);
      setQuestions(resData.data.questions);
    } catch (err) {
      toast(err.message);
    }
  }

  async function handleGetDetailQuestion(questionId) {
    const TOKEN = sessionStorage.getItem("access_token");

    try {
      const res = await axios.get(`${API_URL}/admin/questions/${questionId}`, {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
        },
      });

      if (res.status !== 200) {
        toast("Gagal mengambil list question! 😞");
        console.log(res);
        return;
      }

      setDetQuestions(res.data.data);
    } catch (err) {
      toast(err.message);
      console.log(err);
    }
  }

  async function handleDeleteQuestion(questionId) {
    const TOKEN = sessionStorage.getItem("access_token");

    try {
      const res = await axios.delete(
        `${API_URL}/admin/questions/${questionId}`,
        {
          headers: {
            Authorization: `Bearer ${TOKEN}`,
          },
        }
      );

      if (res.status !== 200) {
        toast("Gagal menghapus data pertanyaan! 😞");
        console.log(res);
        return;
      }

      toast("Data pertanyaan berhasil dihapus! 🥳");
      setTimeout(() => {
        location.reload();
      }, 1000);
    } catch (err) {
      toast(err.message);
      console.log(err);
    }
  }

  const totalPages = Math.ceil(totalQuestion / limit);

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (page <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(
          1,
          "...",
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages
        );
      } else {
        pages.push(1, "...", page - 1, page, page + 1, "...", totalPages);
      }
    }
    return pages;
  };

  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, totalQuestion);

  return (
    <>
      <h1 className="text-2xl mb-10">Questions</h1>
      <Toaster position="top-right" />

      <div className="space-y-4">
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" onClick={() => setOpenDialog(true)}>
              Add
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] max-h-3/4 overflow-y-scroll overflow-x-hidden">
            <DialogHeader>
              <DialogTitle>Add New Question</DialogTitle>
              <DialogDescription>
                Kasih kami pertanyaan dari pikiranmu 🤓
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4">
                {/* Question */}
                <FormField
                  control={form.control}
                  name="question"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Question</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Siapa itu Alan Turing?"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Kasih pertanyaan yang menambah wawasan ya!
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Answers */}
                <FormField
                  control={form.control}
                  name="correctIndex"
                  render={({ field }) => (
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="space-y-3">
                      {fields.map((item, index) => (
                        <div key={item.id} className="flex items-center gap-3">
                          <FormControl>
                            <RadioGroupItem value={String(index)} />
                          </FormControl>

                          <FormField
                            control={form.control}
                            name={`answers.${index}.answer`}
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormControl>
                                  <Input
                                    placeholder={`Answer ${index + 1}`}
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Tombol hapus, tapi hanya muncul kalau lebih dari 2 */}
                          {index >= 2 && (
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => remove(index)}>
                              <Trash2 />
                            </Button>
                          )}
                        </div>
                      ))}
                    </RadioGroup>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`correctIndex`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Add answer button */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => append({ answer: "" })}
                  disabled={fields.length >= 5}>
                  Add Answer
                </Button>

                {/* Categories */}
                <FormField
                  control={form.control}
                  name="categories"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categories</FormLabel>
                      <FormControl>
                        <Input placeholder="Sejarah, IPS" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Explanation Url */}
                <FormField
                  control={form.control}
                  name="explanation_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Explantion Url</FormLabel>
                      <FormControl>
                        <Input placeholder="https://google.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button type="submit" disabled={buttonSaveDisable}>
                    Save
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Grid Data Questions */}
        <Table>
          <TableCaption>List semua pertanyaan random admin 😵</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">#</TableHead>
              <TableHead>Question</TableHead>
              <TableHead className="w-[100px]">Hit</TableHead>
              <TableHead>Categories</TableHead>
              <TableHead className="w-[200px] text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {questions &&
              questions.map((row, index) => (
                <TableRow key={row.id}>
                  <TableCell> {(page - 1) * limit + (index + 1)}</TableCell>
                  <TableCell>{row.content}</TableCell>
                  <TableCell>{row.hit}</TableCell>
                  <TableCell>
                    {row.categories.map((row) => row.name).join(", ")}
                  </TableCell>
                  <TableCell className="space-x-3 text-center">
                    {/* Edit */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          className="hover:cursor-pointer bg-green-600"
                          onClick={() => handleGetDetailQuestion(row.id)}>
                          <SquarePen color="#ffffff" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogTitle>Detail Question</AlertDialogTitle>
                        {/* <AlertDialogDescription></AlertDialogDescription> */}
                        <div className="flex flex-col overflow-hidden gap-2">
                          <div className="flex items-center overflow-hidden">
                            <h1 className="whitespace-nowrap font-semibold">
                              Question :&nbsp;
                            </h1>
                            <p className="truncate min-w-0">{row.content}</p>
                          </div>

                          <div className="flex items-center overflow-hidden">
                            <h1 className="whitespace-nowrap font-semibold">
                              Categories : &nbsp;
                            </h1>
                            <p className="truncate min-w-0">
                              {row.categories.map((row) => row.name).join(", ")}
                            </p>
                          </div>

                          <div className="flex items-center overflow-hidden">
                            <h1 className="whitespace-nowrap font-semibold">
                              Options Answer : &nbsp;
                            </h1>
                            <p className="truncate min-w-0">
                              {row.options.map((row) => row.content).join(", ")}
                            </p>
                          </div>

                          <div className="flex items-center overflow-hidden">
                            <h1 className="whitespace-nowrap font-semibold">
                              True Answer : &nbsp;
                            </h1>
                            <p className="truncate min-w-0">
                              {row.options.map(
                                (row) => row.is_correct && row.content
                              )}
                            </p>
                          </div>

                          <div className="flex items-center overflow-hidden">
                            <h1 className="whitespace-nowrap font-semibold">
                              Explanation :&nbsp;
                            </h1>
                            <p className="truncate min-w-0 text-blue-500 underline">
                              <a target="_blank" href={row.explanation_url}>
                                Click Here
                              </a>
                            </p>
                          </div>

                          <div className="flex items-center overflow-hidden">
                            <h1 className="whitespace-nowrap font-semibold">
                              Created At :&nbsp;
                            </h1>
                            <p className="truncate min-w-0">
                              {new Date(row.created_at).toLocaleString()}
                            </p>
                          </div>

                          <div className="flex items-center overflow-hidden">
                            <h1 className="whitespace-nowrap font-semibold">
                              Updated At :&nbsp;
                            </h1>
                            <p className="truncate min-w-0">
                              {new Date(row.updated_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Close</AlertDialogCancel>
                          <AlertDialogAction
                            className={"bg-blue-500"}
                            onClick={() => setOpenEdit(true)}>
                            <SquarePen /> Edit
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    {/* Hapus */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button className="hover:cursor-pointer bg-red-600">
                          <Trash2 color="#ffffff" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogTitle>
                          Kamu yakin ingin menghapus pertanyaan ini? 🤔
                        </AlertDialogTitle>
                        {/* <AlertDialogDescription>
                        Pertanyaan akan dihapus!
                      </AlertDialogDescription> */}
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className={"bg-red-500"}
                            onClick={() => handleDeleteQuestion(row.id)}>
                            <Trash2 /> Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>

        <Dialog open={openEdit} onOpenChange={setOpenEdit}>
          <DialogContent className="sm:max-w-[425px] max-h-3/4 overflow-y-scroll overflow-x-hidden">
            <DialogHeader>
              <DialogTitle>Add New Question</DialogTitle>
              <DialogDescription>
                Kasih kami pertanyaan dari pikiranmu 🤓
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4">
                {/* Question */}
                <FormField
                  control={form.control}
                  name="question"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Question</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Siapa itu Alan Turing?"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Kasih pertanyaan yang menambah wawasan ya!
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Answers */}
                <FormField
                  control={form.control}
                  name="correctIndex"
                  render={({ field }) => (
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="space-y-3">
                      {fields.map((item, index) => (
                        <div key={item.id} className="flex items-center gap-3">
                          <FormControl>
                            <RadioGroupItem value={String(index)} />
                          </FormControl>

                          <FormField
                            control={form.control}
                            name={`answers.${index}.answer`}
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormControl>
                                  <Input
                                    placeholder={`Answer ${index + 1}`}
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Tombol hapus, tapi hanya muncul kalau lebih dari 2 */}
                          {index >= 2 && (
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => remove(index)}>
                              <Trash2 />
                            </Button>
                          )}
                        </div>
                      ))}
                    </RadioGroup>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`correctIndex`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Add answer button */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => append({ answer: "" })}
                  disabled={fields.length >= 5}>
                  Add Answer
                </Button>

                {/* Categories */}
                <FormField
                  control={form.control}
                  name="categories"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categories</FormLabel>
                      <FormControl>
                        <Input placeholder="Sejarah, IPS" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Explanation Url */}
                <FormField
                  control={form.control}
                  name="explanation_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Explantion Url</FormLabel>
                      <FormControl>
                        <Input placeholder="https://google.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button type="submit" disabled={buttonSaveDisable}>
                    Save
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            {/* Info total data */}
            <p className="text-sm text-gray-500">
              Menampilkan {start}–{end} dari {totalQuestion} data
            </p>

            {/* Pagination */}
            <Pagination>
              <PaginationContent>
                {/* Prev */}
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    className={
                      page === 1 ? "pointer-events-none opacity-50" : ""
                    }
                  />
                </PaginationItem>

                {/* Page numbers */}
                {getPageNumbers().map((p, i) =>
                  p === "..." ? (
                    <PaginationItem key={i}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={i}>
                      <PaginationLink
                        isActive={page === p}
                        onClick={() => setPage(Number(p))}>
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  )
                )}

                {/* Next */}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                    className={
                      page === totalPages
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </>
  );
}
