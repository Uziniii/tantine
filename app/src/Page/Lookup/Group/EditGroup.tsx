import { useRoute } from "@react-navigation/native"
import { useAppSelector } from "../../../store/store"
import { Container } from "../../css/lookup.css"
import styled from "styled-components/native"
import { FText } from "../../../Components/FText"
import { ScrollView, TouchableOpacity } from "react-native-gesture-handler"
import { Dimensions } from "react-native"
import z from "zod"
import { useState } from "react"
import { TextInput } from "../../../utils/formHelpers"
import { Button } from "../../css/auth.css"
import { trpc } from "../../../utils/trpc"

const { width } = Dimensions.get("window")

const DeleteButton = styled(TouchableOpacity)`
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: red;
  padding: 8px 0;
  border-radius: 8px;
  height: 43.7px;
  width: ${width * 0.9}px;
`

const nameInput = z
  .string()
  .trim()
  .min(2, {
    message: "Le nom du groupe doit faire au moins 2 caractères",
  })
  .max(50, {
    message: "Le nom du groupe doit faire maximum 50 caractères",
  })

export default function EditGroup () {
  const route = useRoute<{ params: { id: string }, key: string, name: string }>()
  const group = useAppSelector(state => state.channels[route.params.id])
  const [error, setError] = useState<string>("")
  const editName = trpc.channel.group.editTitle.useMutation()

  if (group.type !== "group") return null

  const onInputChange = (text: string) => {
    const result = nameInput.safeParse(text)

    if (!result.success) {
      setError(result.error.errors[0].message)
      return
    }

    setError("")
  
    editName.mutate({
      channelId: group.id,
      title: result.data
    })
  }

  const onDeleteGroup = () => {

  }

  return <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
    <Container $marginTop={16}>
      <FText $size="20px">Nom du groupe</FText>
      <TextInput $height="43.7px" $width="90%" $borderColor={error ? "red" : undefined} onChangeText={onInputChange} placeholder="Title" defaultValue={group.title} />
      {error && <FText $size="12px" $color="red">{error}</FText>}
      {/* {editName.status === "success" && <FText $size="12px" $color="green">Le nom du groupe a bien étais changé</FText>} */}
      <Button
        $width={`${width * 0.9}px`}
        disabled={!!error}
      >
        <FText $color='white'>Changer le nom</FText>
      </Button>
      <DeleteButton onPress={onDeleteGroup}>
        <FText $color="white" $size="16px">Supprimer le groupe</FText>
      </DeleteButton>
    </Container>
  </ScrollView> 
}
