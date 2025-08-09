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

  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const TOKEN = sessionStorage.getItem("access_token");

  useEffect(() => {
    getAllQuestion();
  }, []);

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

  async function getAllQuestion() {
    // console.log(TOKEN);
    try {
      const res = await axios.get(`${API_URL}/admin/questions`, {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          "Content-Type": "application/json",
        },
      });
      const resData = res.data;

      if (res.status !== 200) {
        toast(res.data.message);
        return;
      }

      setQuestions(resData.data.questions);
    } catch (err) {
      toast(err.message);
    }
  }

  async function handleDeleteQuestion(questionId) {
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
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell className="font-medium">{row.content}</TableCell>
                  <TableCell className="font-medium">{row.hit}</TableCell>
                  <TableCell className="font-medium">
                    {row.categories.map((row) => row.name).join(", ")}
                  </TableCell>
                  <TableCell className="font-medium space-x-3 text-center">
                    {/* Edit */}
                    <Button className="hover:cursor-pointer bg-green-700">
                      <SquarePen color="#ffffff" />
                    </Button>
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
      </div>
    </>
  );
}
