export function AlertDialog() {
  return (
    <>
      <AlertDialog open={alertDialog} onOpenChange={setAlertDialog}>
        <AlertDialogContent>
          <AlertDialogTitle>
            Kamu yakin ingin menghapus pertanyaan ini? 🤔
          </AlertDialogTitle>
          <AlertDialogDescription>lvmdkmvfkmb</AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
