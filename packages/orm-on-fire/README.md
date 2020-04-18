# ORM On Fire
Firestore ORM

Sample:
```typescript
@Doc('users')
export class UserEntity {
    @Field()    
    firstName: string

    @Field()
    lastName: string

    @Doc()
    files: Docs<UserEntity>
}
@Doc('user-files')
export class UserFilesEntity {
    @Field()
    name: string
}

Collection.of<UserEntity>.getOne('fahsdfijyyufre').subscribe((user:UserEntity ) => {
    user.files.forEach(UserEntity => {
    
    })
}) 
```
