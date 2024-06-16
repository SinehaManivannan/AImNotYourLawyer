import { useState, useRef, useEffect } from "react";
import Modal from '@mui/material/Modal';
import Image from "next/image";
import DocsImg from "../../images/doc_img.jpeg";
import {
    UserDocument,
    getDocumentsOwnedByUser,
} from "@/util/requests/getDocumentsOwnedByUser";
import { editDocument } from "@/util/api/editDocument";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { Textarea } from "../ui/textarea";
import { Checkbox } from "../ui/checkbox";

type Props = {
    documents: UserDocument[];
    deleteDocument: (uid: string) => void;
    documentContent: string;
    setDocumentContent: React.Dispatch<React.SetStateAction<string>>;
    includedDocuments: string[];
    setIncludedDocuments: React.Dispatch<React.SetStateAction<string[]>>;
};

const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: "85%",
    height: "85%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
    overflow: "scroll",
    overflowY: "auto",
};

export default function PDFModal({ documents, deleteDocument, documentContent, setDocumentContent, includedDocuments, setIncludedDocuments }: Props) {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [editing, setEditing] = useState("");
  const textFieldRef = useRef<any>(null);
  const [inputValue, setInputValue] = useState("");

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant={"ghost"}
          className="flex w-full justify-start gap-5"
          onClick={handleOpen}
        >
          <Image
            src={"/assets/icons/file-text.svg"}
            width={16}
            height={22}
            alt={"pdf file"}
          />
          <Label>Documents</Label>
        </Button>
      </DialogTrigger>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="min-h-[550px] min-w-[320px] h-full max-h-[85vh] w-full max-w-[60vw] flex flex-col gap-5 overflow-auto box-border"
      >
        <div className="flex flex-col gap-4">
          <Label className="font-bold">Uploaded PDFs</Label>
          <>
            <div className="grid grid-cols-1 gap-2">
              {documents.map((document) => (
                <>
                  <Card key={document.uid} className="">
                    <CardHeader className="flex justify-between flex-row items-center">
                      <Label className="font-bold">{document.name}</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger className="!m-0" asChild>
                            <Checkbox
                              checked={includedDocuments.includes(document.uid)}
                              onClick={() => {
                                if (includedDocuments.includes(document.uid)) {
                                  setDocumentContent(
                                    documentContent.replace(document.text, "")
                                  );
                                  setIncludedDocuments(
                                    includedDocuments.filter(
                                      (docUid: string) => docUid != document.uid
                                    )
                                  );
                                } else {
                                  setDocumentContent(
                                    documentContent + " " + document.text
                                  );
                                  setIncludedDocuments([
                                    ...includedDocuments,
                                    document.uid,
                                  ]);
                                }
                              }}
                            />
                          </TooltipTrigger>
                          <TooltipContent align="end" sideOffset={10}>
                            Include in conversation
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3">
                      <p className="line-clamp-6">{document.text}</p>
                      <div className="flex gap-3 justify-end">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Button
                                variant={"outline"}
                                key="edit-document"
                                onClick={() => {
                                  setEditing(document.uid);
                                  setInputValue(document.text);
                                  if (textFieldRef.current) {
                                    textFieldRef.current.focus();
                                  }
                                }}
                              >
                                <Image
                                  src={"/assets/icons/pencil.svg"}
                                  alt="delete"
                                  height={20}
                                  width={20}
                                />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent align="end">
                              Edit document text
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Button
                                variant={"outline"}
                                key="delete-document"
                                onClick={() => {
                                  deleteDocument(document.uid);
                                }}
                              >
                                <Image
                                  src={"/assets/icons/trash.svg"}
                                  alt="delete"
                                  height={20}
                                  width={20}
                                />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent align="end">
                              Delete document
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Edit PDF */}
                  {editing && (
                    <div className="flex flex-col gap-2 mt-[10px]">
                      <Label className="text-center">Editing {document.name}:</Label>
                      <div className="flex flex-col justify-end">
                        <Textarea
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          ref={textFieldRef}
                          rows={10}
                        />
                        <Button
                          variant="default"
                          className="mt-3 self-end"
                          onClick={() => {
                            if (
                              textFieldRef.current &&
                              textFieldRef.current.value
                            ) {
                              try {
                                editDocument(
                                  editing,
                                  textFieldRef.current?.value
                                );
                                documents.filter(
                                  (doc) => doc.uid == editing
                                )[0].text = textFieldRef.current?.value;
                                setEditing("");
                              } catch (e) {
                                console.error("Error editing document: " + e);
                              }
                            }
                          }}
                        >
                          Save
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              ))}
            </div>
          </>
        </div>
      </DialogContent>
    </Dialog>
  );
}